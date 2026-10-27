import { join } from 'node:path';
import storybookDefaultConfig from '@automattic/calypso-storybook';

export default storybookDefaultConfig( {
	stories: [ '../demo' ],
	webpackAliases: {
		'@automattic/composite-checkout': join( import.meta.dirname, '../src/public-api.ts' ),
	},
} );
