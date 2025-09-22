import { useCallback, useMemo } from '@wordpress/element';
import { prepareTimestamp, getTimeSlotCollisionError, validatePlugins } from '../helpers';
import { useSchedulesBySite } from './use-schedules-by-site';
import type { Frequency, Weekday } from '../../types';

type Inputs = {
	siteIds: number[];
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

export function useScheduleCollisions( inputs?: Partial< Inputs >, options?: { eager?: boolean } ) {
	const { isLoading, timeSlotsBySite, pluginSetsBySite } = useSchedulesBySite();

	const validateNow = useCallback(
		( { siteIds, plugins, frequency, weekday, time }: Inputs ) => {
			// Time collisions
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const proposed = { frequency, timestamp };

			let timeError = '';
			const timeIds = siteIds.filter( ( id ) => {
				const err = getTimeSlotCollisionError( proposed, timeSlotsBySite[ id ] || [] );
				if ( err && ! timeError ) {
					timeError = err;
				}
				return !! err;
			} );

			// Plugin collisions
			let pluginError = '';
			const pluginIds = siteIds.filter( ( id ) => {
				const err = validatePlugins( plugins, pluginSetsBySite[ id ] || [] );
				if ( err && ! pluginError ) {
					pluginError = err;
				}
				return !! err;
			} );

			return {
				isLoading,
				time: { error: timeError, collidingSiteIds: timeIds },
				plugins: { error: pluginError, collidingSiteIds: pluginIds },
			} as const;
		},
		[ isLoading, timeSlotsBySite, pluginSetsBySite ]
	);

	const result = useMemo( () => {
		if ( ! options?.eager ) {
			return undefined;
		}

		if ( ! inputs ) {
			return undefined;
		}

		const { siteIds, plugins, frequency, weekday, time } = inputs;
		if ( ! siteIds || ! frequency || ! weekday || ! time || ! plugins ) {
			return undefined;
		}

		return validateNow( {
			siteIds,
			plugins,
			frequency,
			weekday,
			time,
		} );
	}, [ validateNow, options?.eager, inputs ] );

	return { isLoading, validateNow, result } as const;
}
