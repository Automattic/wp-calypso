const path = require( 'path' );
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );
const config = storybookDefaultConfig();
config.addons.push( '@storybook/addon-backgrounds' );
module.exports = config;
