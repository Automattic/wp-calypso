const path = require( 'path' );
const sharedConfig = require( '../config/_shared.json' );
const devConfig = require( '../config/development.json' );
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

const storybookConfig = storybookDefaultConfig( {
	stories: [
		'../client/components/**/*.stories.{js,jsx,tsx}',
		'../client/blocks/**/*.stories.{js,jsx,tsx}',
		'../client/dashboard/**/*.stories.{js,jsx,tsx}',
		'../client/my-sites/stats/components/**/*.stories.{js,jsx,tsx}',

		'../packages/design-picker/src/**/*.stories.{ts,tsx}',
		'../packages/domains-table/src/**/*.stories.{js,jsx,ts,tsx}',
		'../packages/help-center/src/**/*.stories.{js,jsx,ts,tsx}',
	],
	webpackAliases: { calypso: path.join( __dirname, '../client' ) },
	sassPrelude: `@use 'calypso/assets/stylesheets/shared/_utils.scss' as *;`,
} );

const configData = { ...sharedConfig, ...devConfig };

module.exports = {
	...storybookConfig,

	previewHead: ( head ) => `
		${ head }
			<script>
				window.configData = ${ JSON.stringify( configData ) };
				window.__i18n_text_domain__ = 'default';
			</script>
	`,
};
