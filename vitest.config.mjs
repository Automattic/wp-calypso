import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		projects: [ '{packages,apps}/*/vitest.config.{js,mjs,cjs,ts,mts}' ],
		// The ESLint plugin loads its rules and helpers with `require()`, which Vitest's watcher can't follow.
		forceRerunTriggers: [
			...configDefaults.forceRerunTriggers,
			'**/packages/eslint-plugin-wpcalypso/lib/**/*.js',
		],
	},
} );
