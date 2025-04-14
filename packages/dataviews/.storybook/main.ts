const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

const config = {
	...storybookDefaultConfig(),
	stories: [
		'../src/**/*.stories.@(js|jsx|ts|tsx)',
		'../src/**/*.story.@(js|jsx|ts|tsx)',
	],
};

module.exports = config;
