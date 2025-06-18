import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { useInView } from 'react-intersection-observer';
import { sitePHPVersionQuery } from '../../app/queries/site-php-version';
import { TextBlur } from '../../components/text-blur';
import { hasAtomicFeature } from '../../utils/site-features';
import { HostingFeatures } from '../features';
import type { Site } from '../../data/types';

export default function SitePHPVersion( { site }: { site: Site } ) {
	const hasPHPFeature = hasAtomicFeature( site, HostingFeatures.PHP );
	const { ref, inView } = useInView( {
		triggerOnce: true,
		fallbackInView: true,
	} );

	const { data } = useQuery( {
		...sitePHPVersionQuery( site.ID ),
		enabled: hasPHPFeature && inView,
	} );

	if ( ! hasPHPFeature ) {
		return <Text variant="muted">-</Text>;
	}

	return (
		<>
			<span ref={ ref }>{ data }</span>
			{ ! data && <TextBlur>X.Y</TextBlur> }
		</>
	);
}
