import { OutputStreamControl } from '@gongt/stillalive';
import { spawn, SpawnOptions } from 'child_process';
import { isAbsolute } from 'path';
import { format } from 'util';
import { ProgramError } from '../childprocess/error';
import { parseCommand, processPromise } from '../childprocess/handlers';

let globalLogTarget: NodeJS.WritableStream = process.stderr;

export function useThisStream(stream: NodeJS.WritableStream) {
	globalLogTarget = stream;
}

export function globalLog(msg: any, ...args: any[]) {
	globalLogTarget.write(format(msg, ...args) + '\n');
}

export function globalSuccessMessage(msg: any, ...args: any[]) {
	if (globalLogTarget.hasOwnProperty('success')) {
		(globalLogTarget as OutputStreamControl).success(format(msg, ...args));
	} else {
		globalLogTarget.write(format('Success: ' + msg + '\n', ...args));
	}
}

export function globalSplitLog(msg: any, ...args: any[]) {
	if (globalLogTarget.hasOwnProperty('nextLine')) {
		(globalLogTarget as OutputStreamControl).writeln('');
		(globalLogTarget as OutputStreamControl).nextLine();
	} else {
		globalLogTarget.write('\n');
	}
}

export function globalScreenLog(msg: any, ...args: any[]) {
	if (globalLogTarget['nextLine']) {
		(globalLogTarget as OutputStreamControl).screen.writeln(format(msg, ...args));
	} else {
		globalLogTarget.write(format(msg, ...args) + '\n');
	}
}

export function globalInterruptLog(msg: any, ...args: any[]) {
	const message = format(msg, ...args);
	globalLogTarget.write('---------------\n' + message + '\n');
	if (globalLogTarget['nextLine']) {
		const screen: OutputStreamControl = globalLogTarget as any;
		screen.pause();
		console.error('\r' + message);
		screen.continue();
	}
}

export function spawnWithLog(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions) {
	globalLog(' > %s', options.cwd || process.cwd());
	globalInterruptLog(' + %s %s', command, args.join(' '));
	
	[command, args] = parseCommand(command, args);
	globalLog(' -> + %s %s', command, args.join(' '));
	globalLog('running...');
	const r = spawn(command, args, options);
	
	processPromise(r, [command, args], options).then(() => {
		globalLog('Command %s success.', command);
		globalLog('    ', command, args);
	}, (e: ProgramError) => {
		if (!isAbsolute(command)) {
			globalLog('PATH=%s', options.env.PATH || process.env.PATH);
		}
		globalLog(
			'Command [%s] [%s]\n  Failed with error: code = %s, signal = %s\n%s',
			command, args.join('] ['),
			e.status, e.signal, e.stack);
	});
	
	return r;
}

useThisStream(process.stderr);
