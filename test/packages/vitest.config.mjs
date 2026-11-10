import { configDefaults, defineConfig } from 'vitest/config';

// Workspace packages resolve to their source, as in Jest: CI doesn't build them before the tests.
const CALYPSO_SRC = 'calypso:src';

// Shared by packages that run their tests on Vitest; each extends it with `mergeConfig`.
export default defineConfig( {
	define: {
		__i18n_text_domain__: JSON.stringify( 'default' ),
	},
	resolve: {
		conditions: [ CALYPSO_SRC, 'browser', 'development' ],
	},
	ssr: {
		resolve: {
			conditions: [ CALYPSO_SRC, 'node', 'development' ],
		},
	},
	test: {
		globals: true,
		include: [ '**/test/*.{js,jsx,ts,tsx}' ],
		exclude: [ ...configDefaults.exclude, '**/dist/**' ],
	},
} );
