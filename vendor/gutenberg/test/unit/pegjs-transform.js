const pegjs = require( 'pegjs' );

module.exports = {
	process( src ) {
		// Description of PEG.js options: https://github.com/pegjs/pegjs#javascript-api
		const pegOptions = {
			output: 'source',
			cache: false,
			optimize: 'speed',
			trace: false,
		};
		const methodName = ( typeof pegjs.generate === 'function' ) ? 'generate' : 'buildParser';

		return `module.exports = ${ pegjs[ methodName ]( src, pegOptions ) };`;
	},
};
