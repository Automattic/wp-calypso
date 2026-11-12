import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: {
		environment: 'jsdom',
		include: [ '**/__tests__/**/*.{js,jsx,ts,tsx}' ],
		setupFiles: [ '../../test/packages/match-media.mjs' ],
		// Node refuses `@wordpress/blocks`' JSON imports, which have no `type: 'json'` attribute, so the
		// `@wordpress` packages that reach it go through Vite instead.
		server: { deps: { inline: [ /@wordpress\// ] } },
	},
} );
