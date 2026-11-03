import { HostingFeatures } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import illustrationUrl from './performance-callout-illustration.svg';

export function getBackendCalloutProps() {
	return {
		feature: HostingFeatures.APM,
		upsellId: 'site-performance-backend',
		upsellIcon: chartBar,
		upsellTitle: __( 'Dive deep into your site performance' ),
		upsellImage: illustrationUrl,
		upsellDescription: __(
			'Get request-level tracing, top slow endpoints, and plugin bottleneck detection. Available on Business and Commerce plans.'
		),
	};
}
