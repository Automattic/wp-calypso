import storybookDefaultConfig from '@automattic/calypso-storybook';
const config = storybookDefaultConfig();

export default {
	...config,
	typescript: {
		...config.typescript,
		reactDocgen: 'react-docgen-typescript',
	},
	addons: [ ...( config.addons ?? [] ), '@storybook/addon-a11y' ],
};
