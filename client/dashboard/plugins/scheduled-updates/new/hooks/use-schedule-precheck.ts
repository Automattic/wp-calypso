import { useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useScheduleCollisions } from './use-schedule-collisions';
import type { Frequency, Weekday } from '../../types';
import type { Site } from '@automattic/api-core';

export type PrecheckInputs = {
	siteIds: number[];
	plugins: string[];
	frequency: Frequency;
	weekday: Weekday;
	time: string;
};

type PrecheckOk = { ok: true };
type PrecheckBlocked = { ok: false; message: string; collidingSiteIds: number[] };
export type PrecheckResult = PrecheckOk | PrecheckBlocked;

export type UseSchedulePrecheckReturn = {
	isLoading: boolean;
	precheck: ( inputs: PrecheckInputs ) => PrecheckResult;
};

export function useSchedulePrecheck( eligibleSites: Site[] ): UseSchedulePrecheckReturn {
	const collisionsChecker = useScheduleCollisions();

	const precheck = useCallback(
		( inputs: PrecheckInputs ): PrecheckResult => {
			const { siteIds, plugins, frequency, weekday, time } = inputs;
			const { time: timeCollisions, plugins: pluginCollisions } = collisionsChecker.validateNow( {
				siteIds,
				plugins,
				frequency,
				weekday,
				time,
			} );

			const collisionsError = timeCollisions.error || pluginCollisions.error;
			if ( ! collisionsError ) {
				return { ok: true };
			}

			const collidingSiteIds = timeCollisions.error
				? timeCollisions.collidingSiteIds
				: pluginCollisions.collidingSiteIds;

			const siteMap = new Map( eligibleSites.map( ( s ) => [ s.ID, s ] ) );
			const shouldListSites =
				collidingSiteIds.length > 0 && collidingSiteIds.length < siteIds.length;
			const siteList = shouldListSites
				? collidingSiteIds.map( ( id ) => siteMap.get( id )?.slug || String( id ) ).join( ', ' )
				: '';

			let message = collisionsError;
			if ( shouldListSites ) {
				const sitesLine = sprintf(
					/* translators: %s is a comma-separated list of site slugs. */ __( 'Sites: %s' ),
					siteList
				);
				message = `${ collisionsError }\n${ sitesLine }`;
			}

			return { ok: false, message, collidingSiteIds };
		},
		[ collisionsChecker, eligibleSites ]
	);

	return { isLoading: collisionsChecker.isLoading, precheck } as const;
}
