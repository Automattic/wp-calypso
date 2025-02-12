const storybookDefaultConfig = require( '@automattic/calypso-storybook' );
const config = { ...storybookDefaultConfig(), staticDirs: [ './public' ] };

module.exports = config;
