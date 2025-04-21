const storybookConfig = require( '@automattic/calypso-storybook' );
const path = require( 'path' );

module.exports = storybookConfig( {
	stories: [ '../src/stories/**/*.stories.{js,jsx,ts,tsx}' ],
} );
