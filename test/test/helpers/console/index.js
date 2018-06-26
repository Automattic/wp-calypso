export const captureConsole = ( fn, callback = () => {} ) => {
	const original = console;
	const replacement = {
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn()
	};
	console = replacement;
	let val;
	try {
		val = fn();
	} finally {
		console = original;
	}
	callback( replacement );
	return val;
}
