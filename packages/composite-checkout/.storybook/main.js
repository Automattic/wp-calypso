const { join } = require( 'path' );
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = storybookDefaultConfig( {
	stories: [ '../demo/*.js' ],
	webpackAliases: {
		'@automattic/composite-checkout': join( __dirname, '../src/public-api.ts' ),
	},
} );
