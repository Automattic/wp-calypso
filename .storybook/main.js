const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = storybookDefaultConfig( {
	stories: [ '../client/**/*.stories.{ts,tsx}' ],
} );
