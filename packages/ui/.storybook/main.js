import storybookDefaultConfig from '@automattic/calypso-storybook';

export default storybookDefaultConfig( {
	stories: [ '../{src,styles}/**/*.stories.{js,jsx,ts,tsx}', './**/*.mdx' ],
} );
