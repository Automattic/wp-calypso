const sharedConfig = require( '../config/_shared.json' );
const devConfig = require( '../config/development.json' );
const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

const storybookConfig = storybookDefaultConfig( {
	stories: [
		'../client/**/*.stories.{js,jsx,ts,tsx}',
		'../packages/design-picker/src/**/*.stories.{ts,tsx}',
		'../packages/components/src/**/*.stories.{js,jsx,ts,tsx}',
	],
} );

const configData = { ...sharedConfig, ...devConfig };
storybookConfig.previewHead = ( head ) => `
	${ head }
	<script>
		window.configData = ${ JSON.stringify( configData ) };
	</script>
`;

module.exports = storybookConfig;
