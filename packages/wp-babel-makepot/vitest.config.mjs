import { defineConfig } from 'vitest/config';

// Vitest rather than the repo's Jest: extraction loads @babel/core, and Jest can't require() the ES
// modules Babel 8 ships.
export default defineConfig( {
	test: {
		globals: true,
		environment: 'node',
		include: [ 'test/*.js' ],
	},
} );
