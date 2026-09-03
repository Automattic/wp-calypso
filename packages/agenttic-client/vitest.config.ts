import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		globals: true,
		environment: 'jsdom', // Use jsdom for better browser compatibility
		css: {
			modules: {
				classNameStrategy: 'non-scoped',
			},
		},
	},
} );
