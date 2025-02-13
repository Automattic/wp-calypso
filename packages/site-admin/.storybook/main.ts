const storybookDefaultConfig = require( '@automattic/calypso-storybook' );
const config = { ...storybookDefaultConfig(), staticDirs: [ '../../../client/assets/images' ] };

module.exports = config;
