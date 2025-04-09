const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = {
	...storybookDefaultConfig( {
		stories: [ '../{src,styles}/**/*.stories.{js,jsx,ts,tsx}' ],
	} ),
	docs: { autodocs: true },
};
