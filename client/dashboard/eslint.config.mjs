import { fixupRule } from '@eslint/compat';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import parent from '../eslint.config.mjs';

const snackbarMetaRestriction = {
	// Spreading an api-queries factory and then setting `meta` replaces the
	// whole object, dropping the factory's `meta.statId`.
	selector: "Property[key.name='meta'] > ObjectExpression > Property[key.name='snackbar']",
	message:
		'Setting `meta.snackbar` by hand drops the mutation’s `meta.statId`. Use `withSnackbar()` from app/snackbars/with-snackbar instead.',
};

// A `vi.mock()` of a module whose path matches the `path` regex. `vi.mock()` and
// `vi.doMock()` also take the module as `import( '…' )`. Selector regexes can't
// contain a literal slash, hence `\x2F`.
const mockOf = ( path ) =>
	`CallExpression[callee.object.name='vi'][callee.property.name=/^(mock|doMock|importMock)$/]:matches([arguments.0.value=${ path }], [arguments.0.source.value=${ path }])`;

// Matches the package and its subpaths, but not sibling packages such as
// `@tanstack/react-query-persist-client`.
const packagePath = ( name ) => `/^${ name.replace( '/', '\\x2F' ) }(\\x2F|$)/`;

const bannedModuleMocks = [
	...[ '@tanstack/react-query', '@automattic/api-queries' ].map( ( name ) => ( {
		selector: mockOf( packagePath( name ) ),
		message: `Mocking \`${ name }\` replaces the code under test. Mock the network request with \`nock\`, or pass a \`QueryClient\` holding the data to \`render()\` from test-utils. See docs/testing.md.`,
	} ) ),
	{
		selector: mockOf( packagePath( '@automattic/api-core' ) ),
		message:
			'Mocking `@automattic/api-core` skips the request the code under test makes. Mock the network request with `nock` instead. See docs/testing.md.',
	},
	{
		selector: mockOf( packagePath( '@wordpress/i18n' ) ),
		message:
			'Don’t mock `@wordpress/i18n`. In tests, `__()` and the other functions already return the strings they’re given.',
	},
];

const routerMockRestriction = {
	// A selector can't resolve a relative path, but `app/router` is the dashboard's only
	// folder named `router`, so a relative path through one points at it.
	selector: [
		mockOf( packagePath( '@tanstack/react-router' ) ),
		mockOf( '/^\\.\\.?\\x2F(.*\\x2F)?router(\\x2F|$)/' ),
	].join( ', ' ),
	message:
		'Mocking `@tanstack/react-router` or `app/router/*` breaks whenever the code reads a route the mock doesn’t define. Build the real route tree and a test router instead. See docs/testing.md.',
};

const testFileRestrictions = [
	snackbarMetaRestriction,
	...bannedModuleMocks,
	routerMockRestriction,
];

// Reported once per file.
const misnamedTestFileRestriction = {
	selector:
		'Program:has(CallExpression[callee.name=/^(describe|test|it)$/], CallExpression[callee.object.name=/^(describe|test|it)$/])',
	message:
		'Vitest only runs `*.test.*` files directly inside a `test/` folder, so it skips this file. Rename it, or move it there.',
};

export default defineConfig( [
	...parent,
	{
		name: 'calypso/dashboard',
		rules: {
			'wpcalypso/no-conditional-text-nodes-with-siblings': 'error',
			'wpcalypso/no-return-text-nodes': 'error',
			'no-restricted-imports': [
				'error',
				{
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
								// Allowed: calypso/lib/color-scheme/* (leaf modules, not the barrel)
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
								'!@automattic/site-launch-modals',
								// Please do not add exceptions which pull in Calypso code/concepts.
								// See docs/package-imports.md for policy.
							],
							message: 'Importing from @automattic/ is not allowed in the dashboard folder.',
						},
						{
							group: [ 'calypso/lib/color-scheme/classic-provider' ],
							message:
								'Dashboard must use the query-backed color scheme provider, not the Classic Redux provider.',
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
							message:
								'Please import { useAnalytics } from client/dashboard/app/analytics instead.',
						},
						{
							name: 'calypso/lib/color-scheme',
							message:
								'Import from the leaf modules (e.g. calypso/lib/color-scheme/shared) instead. The barrel pulls the Classic Redux provider and calypso/state into the dashboard.',
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
							message:
								'Please use the @wordpress/i18n package instead of the i18n-calypso package.',
						},
						{
							name: 'moment',
							message: 'Please use date-fns instead of moment.',
						},
						{
							name: '@wordpress/components',
							importNames: [
								'Card',
								'CardBody',
								'CardDivider',
								'CardHeader',
								'CardFooter',
								'CardMedia',
							],
							message:
								'Use local components exported from client/dashboard/components/card instead.',
						},
						{
							name: '@tanstack/react-router',
							importNames: [ 'redirect' ],
							message:
								'Use dashboardRedirect from client/dashboard/app/router/redirect instead. It disables view transitions on redirects.',
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
				},
			],
			'@tanstack/query/exhaustive-deps': 'error',
			'no-restricted-syntax': [ 'error', snackbarMetaRestriction ],
		},
	},
	{
		name: 'calypso/dashboard/tsx-only-for-jsx',
		files: [ '**/*.ts', '**/*.tsx' ],
		// Code blocks in Markdown docs are linted as virtual `.tsx` files.
		ignores: [ '**/*.md/**' ],
		plugins: {
			// The upstream rule still calls `context.getFilename()`, which ESLint 10 removed.
			'dashboard-react': {
				rules: {
					'jsx-filename-extension': fixupRule( reactPlugin.rules[ 'jsx-filename-extension' ] ),
				},
			},
		},
		rules: {
			'dashboard-react/jsx-filename-extension': [
				'error',
				{ extensions: [ '.tsx' ], allow: 'as-needed' },
			],
		},
	},
	{
		name: 'calypso/dashboard/vitest',
		files: [ '**/test/**/*.{js,jsx,ts,tsx}', 'test-utils.tsx' ],
		plugins: { vitest },
		rules: {
			...Object.fromEntries(
				Object.keys( jest.rules ).map( ( rule ) => [ `jest/${ rule }`, 'off' ] )
			),
			...vitest.configs.recommended.rules,
			'vitest/consistent-test-it': [ 'error', { fn: 'test', withinDescribe: 'test' } ],
			'no-restricted-globals': [
				'error',
				{
					name: 'jest',
					message: 'The Dashboard tests run on Vitest. Use `vi` from `vitest` instead.',
				},
			],
			// Replaces the rule's options above, so the snackbar restriction is repeated.
			'no-restricted-syntax': [ 'error', ...testFileRestrictions ],
		},
	},
	{
		name: 'calypso/dashboard/vitest/test-file-names',
		files: [ '**/test/**/*.{js,jsx,ts,tsx}' ],
		ignores: [ '**/test/*.test.{js,jsx,ts,tsx}' ],
		rules: {
			'no-restricted-syntax': [ 'error', ...testFileRestrictions, misnamedTestFileRestriction ],
		},
	},
	{
		name: 'calypso/dashboard/vitest/router-mock-exceptions',
		// These files mocked the router before it was banned. This list should only shrink:
		// to take a file off it, build the real route tree as docs/testing.md explains.
		files: [
			'agency/earn/referrals/test/new-referral-feedback.test.tsx',
			'agency/earn/referrals/test/new-referral-notice.test.tsx',
			'agency/marketplace/products/test/cart-menu.test.tsx',
			'agency/marketplace/referral-checkout/test/index.test.tsx',
			'agency/sites/site/test/overview.test.tsx',
			'app/test/unified-page-view.test.tsx',
			'domains/dns/test/add.test.tsx',
			'domains/domain-diagnostics/test/index.test.tsx',
			'domains/domain-dns/test/index.test.tsx',
			'domains/domain-forwarding/test/index.test.tsx',
			'domains/domain-glue-records/test/index.test.tsx',
			'domains/domain-overview/test/actions.test.tsx',
			'domains/domain-overview/test/index.test.tsx',
			'domains/domain-overview/test/overview-header.test.tsx',
			'domains/domain-overview/test/overview-item-tracks.test.tsx',
			'domains/domain-sidebar/test/index.test.tsx',
			'domains/test/index.test.tsx',
			'domains/test/saved-layout-fallback.test.tsx',
			'emails/test/index.test.tsx',
			'me/billing-purchases/cancel-purchase/cancel-purchase-form/test/index.test.tsx',
			'me/billing-purchases/cancel-purchase/test/index.test.tsx',
			'me/billing-purchases/purchase-settings/test/purchase-notice.test.tsx',
			'me/billing-purchases/test/purchase-removed-notice.test.tsx',
			'me/notifications-emails/subscription-settings/test/index.test.tsx',
			'sites/backups/test/index.test.tsx',
			'sites/domains/test/index.test.tsx',
			'sites/logs-activity/dataviews/test/index.test.tsx',
			'sites/migration-overview/test/started-difm-content-info.test.tsx',
			'sites/performance/test/index.test.tsx',
			'sites/settings-repositories/test/configure-repository.test.tsx',
			'sites/settings-repositories/test/connect-repository.test.tsx',
			'sites/site-plans/test/index.test.tsx',
			'sites/staging-site-delete-modal/test/index.test.tsx',
		],
		rules: {
			'no-restricted-syntax': [ 'error', snackbarMetaRestriction, ...bannedModuleMocks ],
		},
	},
] );
