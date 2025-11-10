declare module 'calypso/server/lib/logger' {
	type LoggerMethod = ( ...args: Array< unknown > ) => void;

	export interface Logger {
		trace: LoggerMethod;
		debug: LoggerMethod;
		info: LoggerMethod;
		warn: LoggerMethod;
		error: LoggerMethod;
		fatal: LoggerMethod;
		child( options?: Record< string, unknown > ): Logger;
	}

	export function getLogger(): Logger;
}
