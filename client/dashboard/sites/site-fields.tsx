import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { useInView } from 'react-intersection-observer';
import { sitePHPVersionQuery } from '../app/queries/site-php-version';
import { siteEngagementStatsQuery } from '../app/queries/site-stats';
import { siteUptimeQuery } from '../app/queries/site-uptime';
import { TextBlur } from '../components/text-blur';
import { JetpackModules } from '../data/constants';
import { hasAtomicFeature, hasJetpackModule } from '../utils/site-features';
import { HostingFeatures } from './features';
import type { Site } from '../data/types';

function IneligibleIndicator() {
	return <Text color="#CCCCCC">-</Text>;
}

function LoadingIndicator( { label }: { label: string } ) {
	return <TextBlur>{ label }</TextBlur>;
}

export function EngagementStat( {
	site,
	type,
}: {
	site: Site;
	type: 'visitors' | 'views' | 'likes';
} ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible =
		! site.is_deleted && ( ! site.jetpack || hasJetpackModule( site, JetpackModules.STATS ) );

	const { data: stats, isLoading } = useQuery( {
		...siteEngagementStatsQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <LoadingIndicator label="100" />;
		}

		return stats?.currentData[ type ];
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function Uptime( { site }: { site: Site } ) {
	const { ref, inView } = useInView( { triggerOnce: true, fallbackInView: true } );
	const isEligible = hasJetpackModule( site, JetpackModules.MONITOR );

	const { data: uptime, isLoading } = useQuery( {
		...siteUptimeQuery( site.ID, 'week' ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	const renderContent = () => {
		if ( isLoading ) {
			return <LoadingIndicator label="100%" />;
		}

		return uptime ? `${ uptime }%` : <IneligibleIndicator />;
	};

	return <span ref={ ref }>{ renderContent() }</span>;
}

export function PHPVersion( { site }: { site: Site } ) {
	const isEligible = hasAtomicFeature( site, HostingFeatures.PHP );
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const { data, isLoading } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	return <span ref={ ref }>{ ! isLoading ? data : <LoadingIndicator label="X.Y" /> }</span>;
}
