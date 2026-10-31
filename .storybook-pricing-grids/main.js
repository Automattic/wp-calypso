import fs from 'node:fs';
import path from 'node:path';
import storybookDefaultConfig from '@automattic/calypso-storybook';

// Storybook evaluates this file as CommonJS, where import.meta is empty, so paths are built
// from the repository root (the directory Storybook is run from).
const root = process.cwd();
const readJson = ( file ) => JSON.parse( fs.readFileSync( path.join( root, file ), 'utf8' ) );
const sharedConfig = readJson( 'config/_shared.json' );
// Production config, so feature flags match what users see.
const productionConfig = readJson( 'config/production.json' );

const storybookConfig = storybookDefaultConfig( {
	stories: [ '../client/**/*.pricing-grid.stories.{js,jsx,tsx}' ],
	webpackAliases: {
		// Browser substitutions from client/webpack.config.js.
		path$: 'path-browserify',
		'calypso/server/lib/logger$': path.join(
			root,
			'client/lib/explat/internals/logger-browser-replacement'
		),
		calypso: path.join( root, 'client' ),
		// Every API call, from the data-stores and from Calypso's `wpcom` client, goes through
		// wpcom-proxy-request in the browser, so one mock answers them all.
		'wpcom-proxy-request': path.join(
			root,
			'.storybook-pricing-grids/mock-wpcom-proxy-request.js'
		),
	},
	sassPrelude: `@use 'calypso/assets/stylesheets/shared/_utils.scss' as *;`,
} );

const configData = { ...sharedConfig, ...productionConfig };

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
