const { join } = require( 'path' );
const storybookDefaultConfig = require( '../../../bin/storybook-default-config' );

module.exports = storybookDefaultConfig( {
	stories: [ '../demo/*.js' ],
	webpackAliases: {
		'@automattic/composite-checkout': join( __dirname, '../src/public-api.ts' ),
	},
} );
