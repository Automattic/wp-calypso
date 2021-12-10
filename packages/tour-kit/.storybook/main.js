const path = require('path');
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );
module.exports = storybookDefaultConfig({
	babelCacheDirectory: path.join(__dirname, "../../../.cache/babel-storybook")
});
