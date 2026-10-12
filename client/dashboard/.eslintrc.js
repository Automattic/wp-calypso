const restrictedImports = {
	patterns: [
		{
			group: [
				'calypso/*',
				// Allowed: calypso/data/data-center
				// Allowed: calypso/data/php-versions
				'!calypso/data',
				'calypso/data/*',
				'!calypso/data/data-center',
				'!calypso/data/php-versions',
				// Allowed: calypso/lib/explat
				// Allowed: calypso/lib/color-scheme
				// Allowed: calypso/lib/interval/use-interval (temporary)
				// Allowed: calypso/lib/load-dev-helpers
				// Allowed: calypso/lib/logstash
				// Allowed: calypso/lib/wp
				'!calypso/lib',
				'calypso/lib/*',
				'!calypso/lib/color-scheme',
				'!calypso/lib/explat',
				'!calypso/lib/interval',
				// Allowed: calypso/lib/use-site-launch-gating-variant (temporary)
				'!calypso/lib/use-site-launch-gating-variant',
				'!calypso/lib/load-dev-helpers',
				'!calypso/lib/logstash',
				'!calypso/lib/version-compare',
				'!calypso/lib/wp',
				// Allowed: calypso/assets/icons
				// Allowed: calypso/assets/images
				'!calypso/assets',
				'calypso/assets/*',
				'!calypso/assets/icons',
				'!calypso/assets/images',
				// Please do not add exceptions which pull in Calypso code/concepts.
				// See docs/package-imports.md for policy.
			],
			message: 'Importing from calypso/ is not allowed in the dashboard folder.',
		},
		{
			group: [
				'@automattic/*',
				'!@automattic/api-core',
				'!@automattic/api-queries',
				'!@automattic/calypso-analytics',
				'!@automattic/calypso-config',
				'!@automattic/calypso-sentry',
				'!@automattic/calypso-support-session',
				'!@automattic/charts',
				'!@automattic/components',
				'@automattic/components/*',
				'!@automattic/components/src',
				'@automattic/components/src/*',
				'!@automattic/components/src/circular-progress-bar',
				'!@automattic/components/src/summary-button',
				'!@automattic/components/src/breadcrumbs',
				'!@automattic/components/src/breadcrumbs/types',
				'!@automattic/components/src/logos',
				'!@automattic/components/src/resurrected-welcome-modal',
				'!@automattic/components/src/experience-control',
				'!@automattic/domain-search',
				'!@automattic/domains-table',
				'!@automattic/domains-table/src/utils/*',
				'!@automattic/generate-password',
				'!@automattic/help-center',
				'!@automattic/agents-manager',
				'!@automattic/i18n-utils',
				'!@automattic/languages',
				'!@automattic/language-picker',
				'!@automattic/load-script',
				'!@automattic/mini-cart',
				'!@automattic/number-formatters',
				'!@automattic/newsletter-urls',
				'!@automattic/onboarding',
				'@automattic/onboarding/*',
				'!@automattic/onboarding/src',
				'@automattic/onboarding/src/*',
				'!@automattic/onboarding/src/utils',
				'@automattic/onboarding/src/utils/*',
				'!@automattic/onboarding/src/utils/email-validation',
				'!@automattic/search',
				'!@automattic/calypso-stripe',
				'!@automattic/calypso-url',
				'!@automattic/composite-checkout',
				'!@automattic/shopping-cart',
				'!@automattic/ui',
				'!@automattic/urls',
				'!@automattic/js-utils',
				'!@automattic/survicate',
				'!@automattic/viewport',
				'!@automattic/browser-data-collector',
				'!@automattic/omnibar',
				'!@automattic/posthog',
				'!@automattic/site-launch-modals',
				// Please do not add exceptions which pull in Calypso code/concepts.
				// See docs/package-imports.md for policy.
			],
			message: 'Importing from @automattic/ is not allowed in the dashboard folder.',
		},
	],
	paths: [
		{
			name: '@automattic/calypso-analytics',
			importNames: [
				'recordTracksEvent',
				'recordTracksPageView',
				'recordTracksPageViewWithPageParams',
			],
			message: 'Please import { useAnalytics } from client/dashboard/app/analytics instead.',
		},
		{
			name: 'calypso/lib/color-scheme',
			importNames: [ 'ClassicColorSchemeProvider' ],
			message:
				'Dashboard must use the query-backed color scheme provider, not the Classic Redux provider.',
		},
		{
			name: '@automattic/components',
			message:
				'Do not import from the barrel file. Use specific imports like @automattic/components/src/summary-button instead. This prevents the entire package being bundled into the dashboard.',
		},
		{
			name: '@automattic/onboarding',
			message:
				'Do not import from the barrel file. Only @automattic/onboarding/src/utils/email-validation is allowed in the dashboard; the rest of the package carries Calypso onboarding concepts.',
		},
		{
			name: 'i18n-calypso',
			message: 'Please use the @wordpress/i18n package instead of the i18n-calypso package.',
		},
		{
			name: 'moment',
			message: 'Please use date-fns instead of moment.',
		},
		{
			name: '@wordpress/components',
			importNames: [ 'Card', 'CardBody', 'CardDivider', 'CardHeader', 'CardFooter', 'CardMedia' ],
			message: 'Use local components exported from client/dashboard/components/card instead.',
		},
		{
			name: '@tanstack/react-router',
			importNames: [ 'redirect' ],
			message:
				'Use dashboardRedirect from client/dashboard/app/router/redirect instead. It disables view transitions on redirects.',
		},
		{
			name: '@automattic/api-queries',
			importNames: [ 'sitesQuery', 'dashboardSiteListQuery', 'dashboardSiteFiltersQuery' ],
			message: 'Use local queries exported from either context or useAppContext instead.',
		},
		{
			name: '@wordpress/element',
			importNames: [
				'useState',
				'useEffect',
				'useCallback',
				'useMemo',
				'useRef',
				'useLayoutEffect',
				'useContext',
				'useReducer',
				'useDebugValue',
				'useImperativeHandle',
				'useSyncExternalStore',
				'useId',
				'useDeferredValue',
				'useTransition',
				'useInsertionEffect',
				'memo',
				'forwardRef',
				'createRef',
				'createContext',
				'lazy',
				'Suspense',
				'StrictMode',
				'Fragment',
				'createElement',
				'cloneElement',
				'isValidElement',
				'Children',
			],
			// The dashboard has a hard dependency on React (unlike Gutenberg,
			// where `@wordpress/element` is from), so we can depend directly
			// on the `react` package. Some imports are still needed from
			// `@wordpress/element` (e.g. `createInterpolateElement`).
			message: 'Import React primitives from "react" instead of "@wordpress/element".',
		},
	],
};

const snackbarMetaSyntax = {
	// Spreading an api-queries factory and then setting `meta` replaces the
	// whole object, dropping the factory's `meta.statId`.
	selector: "Property[key.name='meta'] > ObjectExpression > Property[key.name='snackbar']",
	message:
		'Setting `meta.snackbar` by hand drops the mutation’s `meta.statId`. Use `withSnackbar()` from app/snackbars/with-snackbar instead.',
};

// `config.app` picks per-app variants in route files only (docs/file-based-routing.md,
// decision 3). Everywhere else, branch on `config.supports`.
const appNameSyntax = [
	{
		selector:
			"MemberExpression[property.name='app'][object.name=/^(config|appConfig)$/], MemberExpression[property.name='app'][object.property.name='config'], MemberExpression[property.name='app'][object.callee.name='useAppContext']",
		message:
			'Don’t branch on `config.app`. Use `config.supports`, or `perApp` from app/router/per-app in a route file.',
	},
	{
		selector:
			"VariableDeclarator[init.callee.name='useAppContext'] > ObjectPattern > Property[key.name='app']",
		message:
			'Don’t branch on `config.app`. Use `config.supports`, or `perApp` from app/router/per-app in a route file.',
	},
];

const perAppImportPattern = {
	group: [ '**/per-app' ],
	message: 'The per-app route helpers are only for route files in client/dashboard/routes/.',
};

// New routes go in client/dashboard/routes/ (docs/file-based-routing.md). Remove files
// from this list as Phase A empties them.
const legacyRouterFiles = [
	'app/router/agency-client.tsx',
	'app/router/agency.tsx',
	'app/router/domains.ts',
	'app/router/emails.tsx',
	'app/router/index.tsx',
	'app/router/me.tsx',
	'app/router/plugins.tsx',
	'app/router/root.tsx',
	'app/router/sites.tsx',
	'app/router/start-store.ts',
];

module.exports = {
	rules: {
		'wpcalypso/no-conditional-text-nodes-with-siblings': 'error',
		'wpcalypso/no-return-text-nodes': 'error',
		'no-restricted-imports': [
			'error',
			{ ...restrictedImports, patterns: [ ...restrictedImports.patterns, perAppImportPattern ] },
		],
		'@tanstack/query/exhaustive-deps': 'error',
		'no-restricted-syntax': [ 'error', snackbarMetaSyntax, ...appNameSyntax ],
	},
	overrides: [
		{
			files: [ 'routes/**', 'app/router/test/**' ],
			rules: {
				'no-restricted-imports': [ 'error', restrictedImports ],
			},
		},
		{
			files: [ 'app/router/**' ],
			excludedFiles: [ ...legacyRouterFiles, 'app/router/test/**' ],
			rules: {
				'no-restricted-syntax': [
					'error',
					snackbarMetaSyntax,
					...appNameSyntax,
					{
						selector: "CallExpression[callee.name='createRoute']",
						message:
							'Define new routes in client/dashboard/routes/. See docs/file-based-routing.md.',
					},
				],
			},
		},
		// Last, so it wins over the app/router/** override.
		{
			files: [ 'app/router/per-app.tsx' ],
			rules: {
				'no-restricted-syntax': [ 'error', snackbarMetaSyntax ],
			},
		},
	],
};
