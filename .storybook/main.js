import { createRequire } from 'node:module';
import path from 'node:path';
import storybookDefaultConfig from '@automattic/calypso-storybook';
import webpack from 'webpack';

const require = createRequire( import.meta.url );
const sharedConfig = require( '../config/_shared.json' );
const devConfig = require( '../config/development.json' );

const storybookConfig = storybookDefaultConfig( {
	stories: [
		'../client/components/**/*.stories.{js,jsx,tsx}',
		'../client/blocks/**/*.stories.{js,jsx,tsx}',
		'../client/dashboard/**/*.stories.{js,jsx,ts,tsx}',
		'../client/my-sites/stats/components/**/*.stories.{js,jsx,tsx}',

		'../packages/design-picker/src/**/*.stories.{ts,tsx}',
		'../packages/domains-table/src/**/*.stories.{js,jsx,ts,tsx}',
		'../packages/help-center/src/**/*.stories.{js,jsx,ts,tsx}',
		'../packages/site-launch-modals/src/**/*.stories.{ts,tsx}',
	],
	webpackAliases: { calypso: path.join( import.meta.dirname, '../client' ) },
	sassPrelude: `@use 'calypso/assets/stylesheets/shared/_utils.scss' as *;`,
	plugins: [
		// Same swap as client/webpack.config.js: ExPlat's server logger (bunyan) can't bundle for the browser.
		new webpack.NormalModuleReplacementPlugin(
			/^calypso\/server\/lib\/logger$/,
			'calypso/lib/explat/internals/logger-browser-replacement'
		),
	],
} );

const configData = { ...sharedConfig, ...devConfig };

export default {
	...storybookConfig,

	previewHead: ( head ) => `
		${ head }
			<script>
				window.configData = ${ JSON.stringify( configData ) };
				window.__i18n_text_domain__ = 'default';
			</script>
	`,
};
