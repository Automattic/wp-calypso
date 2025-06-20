import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { siteEngagementStatsQuery } from '../app/queries/site-stats';
import { siteUptimeQuery } from '../app/queries/site-uptime';
import { TextBlur } from '../components/text-blur';
import type { Site } from '../data/types';

export function EngagementStat( {
	site,
	type,
}: {
	site: Site;
	type: 'visitors' | 'views' | 'likes';
} ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible =
		! site.is_deleted && ( ! site.jetpack || site.jetpack_modules?.includes( 'stats' ) );

	const { data: stats, isLoading } = useQuery( {
		...siteEngagementStatsQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return '-';
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <TextBlur>100</TextBlur>;
		}

		return stats?.currentData[ type ];
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function Uptime( { site }: { site: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = !! site.jetpack_modules?.includes( 'monitor' );

	const { data: uptime, isLoading } = useQuery( {
		...siteUptimeQuery( site.ID, 'week' ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return '-';
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <TextBlur>100%</TextBlur>;
		}

		return uptime ? `${ uptime }%` : '-';
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}
