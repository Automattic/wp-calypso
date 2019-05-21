const isBrowser = process.env.BROWSERSLIST_ENV !== 'server';
const codeSplit = require( './server/config' ).isEnabled( 'code-splitting' );

// We implicitly use browserslist configuration in package.json for build targets.

const config = {
	presets: [ '@babel/preset-typescript' ],
	plugins: [
		'@babel/plugin-transform-react-jsx',
		'@babel/plugin-transform-react-display-name',
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-syntax-dynamic-import',
		[ '@automattic/transform-wpcalypso-async', { async: isBrowser && codeSplit } ],
	],
};

module.exports = config;
