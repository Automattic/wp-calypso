import { HostingFeatures } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationUrl from './monitoring-callout-illustration.svg';
import type { Site } from '@automattic/api-core';

export function getMonitoringCalloutProps() {
	return {
		feature: HostingFeatures.MONITOR,
		upsellId: 'site-monitoring',
		upsellIcon: chartBar,
		upsellTitle: __( 'Monitor server stats' ),
		upsellImage: illustrationUrl,
		upsellDescription: __(
			'Track how your server responds to traffic, identify performance bottlenecks, and investigate error spikes to keep your site running smoothly.'
		),
	};
}

export function MonitoringCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<UpsellCallout
			{ ...getMonitoringCalloutProps() }
			upsellTitleAs={ titleAs }
			site={ { slug: siteSlug } as Site }
		/>
	);
}
