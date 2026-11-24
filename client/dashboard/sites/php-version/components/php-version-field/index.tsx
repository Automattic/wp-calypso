import { HostingFeatures } from '@automattic/api-core';
import { siteEnvironmentPHPVersionQuery, sitePHPVersionQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { TextBlur } from '../../../../components/text-blur';
import { hasHostingFeature } from '../../../../utils/site-features';
import { canViewPHPVersion } from '../../../features';
import { IneligibleIndicator } from '../../../site-fields';
import type { Site } from '@automattic/api-core';

export function PHPVersion( { site }: { site: Site } ) {
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const isEligible = canViewPHPVersion( site );
	const { data, isLoading } = useQuery( {
		...( hasHostingFeature( site, HostingFeatures.PHP )
			? sitePHPVersionQuery( site.ID )
			: siteEnvironmentPHPVersionQuery( site.ID ) ),
		enabled: isEligible && inView,
	} );

	if ( ! isEligible ) {
		return <IneligibleIndicator />;
	}

	return (
		<span ref={ ref }>
			<TextBlur isBlurred={ isLoading }>{ isLoading ? 'X.Y' : data }</TextBlur>
		</span>
	);
}
