import { useMemo } from 'react';
import type { SubscriberStats } from '../types';

function formatNumber( num: number ) {
	if ( Number.isInteger( num ) ) {
		return num;
	}
	return parseFloat( num.toFixed( 1 ) );
}
const useSubscriberStatsRate = (
	subscriberStats: SubscriberStats | undefined,
	property: keyof Omit< SubscriberStats, 'emails_sent' | 'blog_registration_date' >
) => {
	return useMemo( () => {
		if ( subscriberStats && subscriberStats.emails_sent && subscriberStats[ property ] ) {
			const rate = ( subscriberStats[ property ] / subscriberStats.emails_sent ) * 100;
			return formatNumber( rate );
		}
		return 0; // Note: This now returns 0 as a number, not '0' as a string.
	}, [ subscriberStats, property ] );
};

export default useSubscriberStatsRate;
