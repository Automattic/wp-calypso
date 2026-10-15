import storybookDefaultConfig from '@automattic/calypso-storybook';
import webpack from 'webpack';

export default storybookDefaultConfig( {
	plugins: [
		new webpack.ProvidePlugin( {
			process: 'process/browser.js',
		} ),
	],
} );
