import { SettingsRenderer, } from 'vs/workbench/parts/preferences/browser/settingsTree';
import { SettingsTreeElement, SettingsTreeSettingElement } from 'vs/workbench/parts/preferences/browser/settingsTreeModels';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { dispose } from 'vs/base/common/lifecycle';
import { IInstantiationService, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { ISettingItemTemplate } from 'vs/kendryte/vs/workbench/config/common/type';
import { SettingValueType } from 'vs/workbench/services/preferences/common/preferences';

export interface FieldContext {
	context?: SettingsTreeSettingElement;
}

export type FieldTemplate<T, EX = void> = ISettingItemTemplate<T> & EX & FieldContext;

export abstract class FieldInject<T, EX extends object> {
	constructor(
		protected ref: SettingsRenderer,
		@IInstantiationService protected instantiationService: IInstantiationService,
	) {
		instantiationService.invokeFunction((access) => {
			for (const sid of this.dependency()) {
				let varName = sid.toString().replace(/^I/, '');
				varName = varName[0].toLowerCase() + varName.slice(1);
				this[varName] = access.get(sid);
			}
		});
	}

	protected abstract ID: string;

	protected abstract dependency(): ServiceIdentifier<any>[];

	protected abstract _template(tree: ITree, common: ISettingItemTemplate<T> & FieldContext, container: HTMLElement): EX;

	protected abstract _entry(tree: ITree, element: SettingsTreeSettingElement, template: FieldTemplate<T, EX>): void;

	protected abstract _detect(element: SettingsTreeSettingElement): boolean;

	protected _dispose(tree: ITree, template: FieldTemplate<T, EX>): void { }

	protected fireChangeEvent(template: FieldContext, event: { value: T, type: SettingValueType }) {
		this.ref['_onDidChangeSetting'].fire({
			key: template.context.setting.key,
			value: event.value,
			type: event.type,
		});
	}

	public template(tree: ITree, templateId: string, container: HTMLElement): FieldTemplate<T, EX> | void {
		if (templateId === this.ID) {
			const common: ISettingItemTemplate<T> = this.ref['renderCommonTemplate'](tree, container, templateId.replace(/\./g, '_')) as any;
			return Object['assign'](common, this._template(tree, common, container));
		}
	}

	public entry(tree: ITree, element: SettingsTreeSettingElement, templateId: string, template: FieldTemplate<T, EX>): boolean {
		if (templateId === this.ID) {
			this.ref['renderSettingElement'](tree, element, templateId, template as any /*ISettingIteanymTemplate*/);
			this._entry(tree, element, template);
			template.context = element;
			return true;
		} else {
			return false;
		}
	}

	public dispose(tree: ITree, templateId: string, template: FieldTemplate<T, EX>): boolean {
		if (templateId === this.ID) {
			this._dispose(tree, template);
			dispose(template.toDispose);
			return true;
		} else {
			return false;
		}
	}

	public detect(element: SettingsTreeElement): string | void {
		if (element instanceof SettingsTreeSettingElement) {
			if (this._detect(element)) {
				return this.ID;
			}
		}
	}
}