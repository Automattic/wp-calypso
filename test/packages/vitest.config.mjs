import { configDefaults, defineConfig } from 'vitest/config';

// Workspace packages resolve to their source, as in Jest: CI doesn't build them before the tests.
// The condition lists are spelled out rather than spread from Vite's defaults to leave out
// `module`, which Jest doesn't match either.
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
		// Vitest otherwise cuts `$name` test titles at 40 characters.
		taskTitleValueFormatTruncate: 0,
		// Vitest otherwise clears mocks before each test, dropping calls made in a `beforeAll`.
		clearMocks: false,
	},
} );
