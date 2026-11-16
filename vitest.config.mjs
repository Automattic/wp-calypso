import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		projects: [
			'{packages,apps}/*/vitest.config.{js,mjs,cjs,ts,mts}',
			// Not installed unless it's added back to the root `workspaces`; it runs its own `test` script.
			'!packages/wp-babel-makepot/vitest.config.mjs',
		],
		// These packages load their own modules with `require()`, which Vitest's watcher can't follow.
		forceRerunTriggers: [
			...configDefaults.forceRerunTriggers,
			'**/packages/eslint-plugin-wpcalypso/lib/**/*.js',
			'**/packages/i18n-calypso-cli/{*,formatters/*}.js',
		],
	},
} );
