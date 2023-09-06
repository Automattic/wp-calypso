const defaultPreset = require( './default' );

module.exports = {
	...defaultPreset,
	plugins: [
		[ '@babel/plugin-proposal-decorators', { version: '2023-05' } ],
		...defaultPreset.plugins,
	],
};
