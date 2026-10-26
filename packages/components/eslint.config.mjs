import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{ languageOptions: { globals: browserGlobals } },
	{
		files: [ '**/docs/example.jsx', '**/*.md/*.js', '**/*.md/*.jsx' ],
		// These are consumed only by Calypso's webpack build, it is ok to import other Calypso components
		rules: {
			'no-restricted-imports': 'off',
		},
	},
	{
		// Used by the Dashboard, which shouldn't import legacy Calypso code.
		files: [ 'breadcrumbs', 'circular-progress-bar', 'logos', 'summary-button' ].map(
			( component ) => `src/${ component }/**`
		),
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'calypso/*',
								// Allowed: calypso/assets/icons
								// Allowed: calypso/assets/images
								'!calypso/assets',
								'calypso/assets/*',
								'!calypso/assets/icons',
								'!calypso/assets/images',
								// Please do not add exceptions unless agreed on
								// with the #architecture group.
							],
							message:
								'Importing from calypso/ is not allowed for this component. It is used by the client/dashboard and we should avoid importing legacy Calypso code into the dashboard.',
						},
						{
							group: [
								'@automattic/*',
								'!@automattic/calypso-config',
								'!@automattic/components',
								'!@automattic/number-formatters',
								'!@automattic/ui',
								'!@automattic/viewport',
								// Please do not add exceptions unless agreed on
								// with the #architecture group.
							],
							message:
								'Importing from @automattic/ is not allowed for this component. It is used by the client/dashboard and we should avoid importing legacy Calypso code into the dashboard.',
						},
					],
				},
			],
		},
	},
] );
