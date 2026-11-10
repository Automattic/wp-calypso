import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		projects: [ '{packages,apps}/*/vitest.config.{js,mjs,cjs,ts,mts}' ],
	},
} );
