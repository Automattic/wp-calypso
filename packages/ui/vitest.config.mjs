import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: {
		environment: 'jsdom',
		// The calendar tests fix "now" at 20:00 UTC, so which day is "today" depends on the time zone.
		env: { TZ: 'UTC' },
		// tsup's declaration build leaves `.d.ts` copies of the tests here.
		exclude: [ '**/.tsup/**' ],
	},
} );
