import { useMemo } from 'react';
import type { SubscriberStats } from '../types';

const useSubscriberStatsRate = (
	subscriberStats: SubscriberStats | undefined,
	property: keyof Omit< SubscriberStats, 'emails_sent' >
) => {
	return useMemo( () => {
		if ( subscriberStats && subscriberStats.emails_sent && subscriberStats[ property ] ) {
			return ( ( subscriberStats[ property ] / subscriberStats.emails_sent ) * 100 ).toFixed( 1 );
		}
		return 0;
	}, [ subscriberStats, property ] );
};

export default useSubscriberStatsRate;
