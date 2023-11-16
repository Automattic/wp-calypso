const defaultPreset = require( './default' );

module.exports = {
	...defaultPreset,
	plugins: [
		[ '@babel/plugin-proposal-decorators', { version: 'legacy' } ],
		...defaultPreset.plugins,
	],
};
