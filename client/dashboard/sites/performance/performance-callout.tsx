import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationUrl from './performance-callout-illustration.svg';
import type { Site } from '@automattic/api-core';

export function getPerformanceCalloutProps() {
	return {
		tracksFeatureId: 'performance',
		upsellIcon: chartBar,
		upsellTitle: __( 'Optimize your site’s performance' ),
		upsellImage: illustrationUrl,
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
