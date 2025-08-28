import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import filesize from 'filesize';
import { siteMetricsQuery } from '../../app/queries/site-metrics';
import { Stat } from '../../components/stat';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '../../data/types';

function getCurrentMonthRangeTimestamps() {
	const now = new Date();
	const firstDayOfMonth = new Date( now.getFullYear(), now.getMonth(), 1 );
	const startInSeconds = Math.floor( firstDayOfMonth.getTime() / 1000 );

	const today = new Date();
	today.setMinutes( 59 );
	today.setSeconds( 59 );
	const endInSeconds = Math.floor( today.getTime() / 1000 );

	return {
		startInSeconds,
		endInSeconds,
	};
}

export default function SiteBandwidthStat( { site }: { site: Site } ) {
	const { startInSeconds, endInSeconds } = getCurrentMonthRangeTimestamps();
	const { data: bandwidth, isLoading: isLoadingBandwidth } = useQuery( {
		...siteMetricsQuery( site.ID, {
			start: startInSeconds,
			end: endInSeconds,
			metric: 'response_bytes_persec',
		} ),
		enabled: !! site.is_wpcom_atomic,
		select: ( data ) => {
			if ( ! data ) {
				return data;
			}
			const domain = getSiteDisplayUrl( site );
			return data.data.periods.reduce(
				( acc, curr ) => acc + ( curr.dimension[ domain ] || 0 ),
				0
			);
		},

		// Don't update until page is refreshed
		meta: { persist: false },
		staleTime: Infinity,
	} );

	return (
		<Stat
			density="high"
			strapline={ __( 'Bandwidth' ) }
			metric={
				bandwidth && site.is_wpcom_atomic ? filesize( bandwidth, { round: 1 } ) : __( 'Unlimited' )
			}
			description={ site.is_wpcom_atomic ? __( 'Unlimited' ) : undefined }
			progressValue={ 100 }
			progressColor="alert-green"
			isLoading={ isLoadingBandwidth }
		/>
	);
}
