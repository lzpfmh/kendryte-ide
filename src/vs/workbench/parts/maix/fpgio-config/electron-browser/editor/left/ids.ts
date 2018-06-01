import { IListEntry } from 'vs/workbench/services/preferences/common/keybindingsEditorModel';

export enum TEMPLATE_ID {
	CHIP_SELECT = 'template.left.chip.select',
	SPLIT = 'template.left.split',
	FUNC_MAP = 'template.left.map.func',
	FUNC_MAP_HIDE = 'template.left.map.func_hide',
	FUNC_MAP_GROUP = 'template.left.map.group',
	CHIP_PLEASE_SELECT = 'template.left.map.empty',
}

export interface IListSplitEntry extends IListEntry {
	templateId: TEMPLATE_ID;
}

export interface IListEmptyEntry extends IListSplitEntry {
}

export interface IListGroupEntry extends IListSplitEntry {
	description: string;
}

export interface IListFuncMapEntry extends IListSplitEntry {
	currentPin: string; // A3 B7 ...
	templateId: TEMPLATE_ID.FUNC_MAP | TEMPLATE_ID.FUNC_MAP_HIDE;
	pin: string;
	description: string;
	full: string;
}

export interface IListChipSelectEntry extends IListSplitEntry {
	templateId: TEMPLATE_ID.CHIP_SELECT;
	selected: string;
}

export type IFpgioLeftListEntry = IListSplitEntry | IListFuncMapEntry | IListChipSelectEntry;
