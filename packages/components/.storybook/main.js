const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = {
	...storybookDefaultConfig( {
		stories: [ '../{src,styles}/**/*.stories.{js,jsx,ts,tsx}', '../{src,styles}/**/*.mdx' ],
	} ),
	docs: { autodocs: true },
};
