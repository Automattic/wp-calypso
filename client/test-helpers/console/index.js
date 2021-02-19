export const captureConsole = ( testFn ) => ( callback = () => {} ) => {
	const original = console;
	const replacement = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	};
	console = replacement;
	let val;
	try {
		val = testFn();
	} finally {
		console = original;
	}
	callback( replacement );
	return val;
};
