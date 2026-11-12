import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	// The calendar tests fix "now" at 20:00 UTC, so which day is "today" depends on the time zone.
	test: { environment: 'jsdom', env: { TZ: 'UTC' } },
} );
