import type { StorybookConfig } from '@storybook/react-webpack5';
import storybookDefaultConfig from '@automattic/calypso-storybook';
const config = storybookDefaultConfig();

export default {
	...config,
	staticDirs: [ ...( config.staticDirs ?? [] ), '../static' ],
	typescript: {
		...config.typescript,
		reactDocgen: 'react-docgen-typescript',
	},
	addons: [ ...( config.addons ?? [] ), '@storybook/addon-a11y' ],
};
