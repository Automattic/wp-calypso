import { HostingFeatures } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { ThemedIllustration } from '../../../../components/themed-illustration';
import UpsellCallout from '../../../hosting-features/components/hosting-feature-upsell-callout';
import illustrationDarkUrl from '../upsell-illustration/upsell-illustration-dark.svg';
import illustrationUrl from '../upsell-illustration/upsell-illustration.svg';
import type { Site } from '@automattic/api-core';
import type { JSX } from 'react';

export function getPerformanceCalloutProps() {
	return {
		feature: HostingFeatures.PERFORMANCE,
		upsellId: 'site-performance',
		upsellIcon: chartBar,
		upsellTitle: __( 'Optimize your site’s performance' ),
		upsellImage: <ThemedIllustration light={ illustrationUrl } dark={ illustrationDarkUrl } />,
		upsellDescription: __(
			'Make smarter decisions, boost speed and engagement, and see how your site‘s performing with key metrics and contextual insights.'
		),
	};
}

export function PerformanceCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<UpsellCallout
			{ ...getPerformanceCalloutProps() }
			upsellTitleAs={ titleAs }
			site={ { slug: siteSlug } as Site }
		/>
	);
}
