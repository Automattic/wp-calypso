import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { siteUptimeQuery } from '../app/queries/site-uptime';
import { TextBlur } from '../components/text-blur';
import type { Site } from '../data/types';

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
