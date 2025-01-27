import { translate } from 'i18n-calypso';
import {
	STATS_FEATURE_INTERVAL_DROPDOWN_DAY,
	STATS_FEATURE_INTERVAL_DROPDOWN_MONTH,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_INTERVAL_DROPDOWN_YEAR,
	STATS_PERIOD,
} from 'calypso/my-sites/stats/constants';
import { useSelector } from 'calypso/state';
import { shouldGateStats } from './use-should-gate-stats';

type IntervalType = {
	id: string;
	label: string;
	isGated: number;
	statType: string;
};

type IntervalsType = {
	[ key: string ]: IntervalType;
};

const intervals = {
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
};

function useIntervals( siteId: number | null ): IntervalsType {
	const gatedIntervals = useSelector( ( state ) => {
		return Object.keys( intervals ).reduce( ( acc, key ) => {
			const interval = intervals[ key ];

			return {
				...acc,
				[ key ]: {
					...interval,
					isGated: shouldGateStats( state, siteId, interval.statType ),
				},
			};
		}, {} );
	} );

	return gatedIntervals;
}

export default useIntervals;
