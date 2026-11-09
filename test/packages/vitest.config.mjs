import { configDefaults, defineConfig } from 'vitest/config';

// Shared by packages that run their tests on Vitest; each extends it with `mergeConfig`.
export default defineConfig( {
	define: {
		__i18n_text_domain__: JSON.stringify( 'default' ),
	},
	test: {
		globals: true,
		include: [ '**/test/*.{js,jsx,ts,tsx}' ],
		exclude: [ ...configDefaults.exclude, '**/dist/**' ],
	},
} );
