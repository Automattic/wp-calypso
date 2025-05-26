import debug from 'debug';
import chalk from 'chalk';

// Force color support for chalk
process.env.FORCE_COLOR = '1'; // Force color output
chalk.level = 3; // Truecolor support (16 million colors)

// Single debug instance for the entire agenttic-client package
export const logger = debug('agenttic-client');

// Helper to check if debugging is enabled
export function isDebugEnabled(): boolean {
	return debug.enabled('agenttic-client');
}

// Helper to enable debugging
export function enableDebug(): void {
	debug.enabled = () => true;
	process.env.DEBUG = 'agenttic-client';
}

// Helper to format objects for logging
export function formatObject(obj: any): string {
	return JSON.stringify(obj, null, 2);
}

// Color functions using chalk
const colors = {
	reset: (text: string) => text,
	red: (text: string) => chalk.red(text),
	green: (text: string) => chalk.green(text),
	yellow: (text: string) => chalk.yellow(text),
	blue: (text: string) => chalk.blue(text),
	magenta: (text: string) => chalk.magenta(text),
	dim: (text: string) => chalk.dim(text),
};

type ColorName = keyof typeof colors;

/**
 * Console wrapper for CLI output with color support
 * Centralizes all console logging so we can change formatting in one place
 *
 * @param color   - Color name or 'none' for no color
 * @param message - Message to log
 * @param args    - Additional arguments to pass to console.log
 */
// eslint-disable-next-line no-console
export function log(
	color: ColorName | 'none',
	message: string,
	...args: any[]
): void {
	if (color === 'none') {
		// eslint-disable-next-line no-console
		console.log(message, ...args);
	} else {
		const colorFn = colors[color];
		// eslint-disable-next-line no-console
		console.log(colorFn(message), ...args);
	}
}

/**
 * Convenience methods for common log types
 */
export const cliLog = {
	// User-facing messages
	info: (message: string, ...args: any[]) => log('none', message, ...args),
	success: (message: string, ...args: any[]) =>
		log('green', message, ...args),
	warning: (message: string, ...args: any[]) =>
		log('yellow', message, ...args),
	error: (message: string, ...args: any[]) => log('red', message, ...args),

	// Agent responses
	agent: (message: string, ...args: any[]) => log('blue', message, ...args),

	// System messages
	system: (message: string, ...args: any[]) =>
		log('magenta', message, ...args),
	debug: (message: string, ...args: any[]) => log('dim', message, ...args),
};
