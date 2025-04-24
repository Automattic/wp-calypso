import { createSelector } from '@automattic/state-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	STATS_FEATURE_INTERVAL_DROPDOWN_DAY,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_PERIOD,
} from 'calypso/my-sites/stats/constants';
import { useSelector } from 'calypso/state';
import { shouldGateStats } from './use-should-gate-stats';
import type { AppState } from 'calypso/types';

type IntervalType = {
	id: string;
	label: string;
	isGated: boolean;
	statType: string;
};

type IntervalsType = {
	[ key: string ]: IntervalType;
};

const getGatedIntervals = createSelector(
	(
		state: AppState,
		siteId: number | null,
		intervals: Record< string, Omit< IntervalType, 'isGated' > >
	) => {
		return Object.fromEntries(
			Object.entries( intervals ).map( ( [ key, interval ] ) => [
				key,
				{
					...interval,
					isGated: shouldGateStats( state, siteId, interval.statType ),
				},
			] )
		) as IntervalsType;
	},
	( state, siteId, intervals: Record< string, Omit< IntervalType, 'isGated' > > ) => {
		return [
			...Object.values( intervals ).map( ( { statType } ) =>
				shouldGateStats( state, siteId, statType )
			),
			intervals,
		];
	}
);

function useIntervals( siteId: number | null ): IntervalsType {
	const translate = useTranslate();
	const intervals = useMemo(
		() => ( {
			[ STATS_PERIOD.DAY ]: {
				id: STATS_PERIOD.DAY,
				label: translate( 'Days' ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_DAY,
			},
			[ STATS_PERIOD.WEEK ]: {
				id: STATS_PERIOD.WEEK,
				label: translate( 'Weeks' ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
			},
			[ STATS_PERIOD.MONTH ]: {
				id: STATS_PERIOD.MONTH,
				label: translate( 'Months' ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
			},
			[ STATS_PERIOD.YEAR ]: {
				id: STATS_PERIOD.YEAR,
				label: translate( 'Years' ),
				statType: STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
			},
		} ),
		[ translate ]
	);

	return useSelector( ( state ) => getGatedIntervals( state, siteId, intervals ) );
}

export default useIntervals;
