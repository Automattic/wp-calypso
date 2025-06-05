const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = {
	...storybookDefaultConfig( {
		stories: [
			'../{src,styles}/**/*.stories.{js,jsx,ts,tsx}',
			'../{src,styles,.storybook}/**/*.mdx',
		],
	} ),
	docs: { autodocs: true },
};
