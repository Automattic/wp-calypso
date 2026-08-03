import { useMemo } from 'react';
import guessTimezone from '../guess-timezone';
import { getDeliveryWindowOffsetHours } from './conversion';

export type DeliveryWindowTimezone = {
	/** The detected IANA timezone, or undefined when it could not be detected. */
	timezone: string | undefined;
	/** Whole-hour offset from UTC, or null when the timezone is unknown. */
	offsetHours: number | null;
	/** True when we could not detect a timezone and should display raw UTC. */
	isUtcFallback: boolean;
};

/**
 * Detect the device timezone (via `guessTimezone`) and derive the whole-hour
 * offset used to convert delivery windows between UTC and local time.
 *
 * When the timezone cannot be detected, `isUtcFallback` is true and callers
 * should display the raw UTC values with a clear "UTC" label.
 */
export default function useDeliveryWindowTimezone(): DeliveryWindowTimezone {
	return useMemo( () => {
		const timezone = guessTimezone();
		const offsetHours = getDeliveryWindowOffsetHours( timezone );

		return {
			timezone,
			offsetHours,
			isUtcFallback: offsetHours === null,
		};
	}, [] );
}
