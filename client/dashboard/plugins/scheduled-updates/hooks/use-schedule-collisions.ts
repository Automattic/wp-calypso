import { useCallback, useMemo } from '@wordpress/element';
import { prepareTimestamp, validateTimeSlot, validatePlugins } from '../helpers';
import { useSchedulesBySite } from './use-schedules-by-site';
import type { Frequency, Weekday, ScheduleCollisions } from '../types';

type Inputs = {
	siteIds: number[];
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

type Options = {
	/**
	 * Whether to validate eagerly. If false, `HookResult[ "result" ]` will remain undefined.
	 */
	eager?: boolean;
};

type ValidationResult = ScheduleCollisions & { isLoading: boolean };

type HookResult = {
	isLoading: boolean;
	validateNow: ( inputs: Inputs ) => ValidationResult;
	result: ValidationResult | undefined; // undefined if `Options[ "eager" ]` is false.
};

/**
 * Validates time and plugin collisions for a given set of inputs.
 * @param {Inputs} inputs - The inputs to validate.
 * @param {Options} options - The options for the validation.
 * @returns {HookResult} The hook's return value containing the API and result.
 */
export function useScheduleCollisions( inputs?: Partial< Inputs >, options?: Options ): HookResult {
	const { isLoading, timeSlotsBySite, pluginSetsBySite } = useSchedulesBySite();

	const validateNow = useCallback(
		( { siteIds, plugins, frequency, weekday, time }: Inputs ) => {
			// Time collisions
			const timestamp = prepareTimestamp( frequency, weekday, time );
			const proposed = { frequency, timestamp };

			let timeError = '';
			const timeIds = siteIds.filter( ( id ) => {
				const err = validateTimeSlot( proposed, timeSlotsBySite[ id ] || [] );
				// Record only the first non-empty error as the representative message.
				// We still collect all colliding site IDs, but avoid overwriting the message.
				if ( err && ! timeError ) {
					timeError = err;
				}
				return Boolean( err );
			} );

			// Plugin collisions (skip when empty)
			let pluginError = '';
			const pluginIds =
				plugins.length === 0
					? []
					: siteIds.filter( ( id ) => {
							const err = validatePlugins( plugins, pluginSetsBySite[ id ] || [] );
							// Same approach as time collisions: capture the first error message only,
							// ensuring a stable representative error while still collecting all sites.
							if ( err && ! pluginError ) {
								pluginError = err;
							}
							return Boolean( err );
					  } );

			return {
				isLoading,
				timeCollisions: { error: timeError, collidingSiteIds: timeIds },
				pluginCollisions: { error: pluginError, collidingSiteIds: pluginIds },
			};
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

	return { isLoading, validateNow, result };
}
