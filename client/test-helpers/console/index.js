/* eslint-disable no-global-assign */

export const captureConsole = ( testFn ) => ( callback = () => {} ) => {
	const original = globalThis.console;
	const replacement = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};
	globalThis.console = replacement;
	let val;
	try {
		val = testFn();
	} finally {
		globalThis.console = original;
	}
	callback( replacement );
	return val;
};
