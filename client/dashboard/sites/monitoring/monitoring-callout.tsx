import { HostingFeatures } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { ThemedIllustration } from '../../components/themed-illustration';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationDarkUrl from './monitoring-callout-illustration-dark.svg';
import illustrationUrl from './monitoring-callout-illustration.svg';
import type { Site } from '@automattic/api-core';
import type { JSX } from 'react';

export function getMonitoringCalloutProps() {
	return {
		feature: HostingFeatures.MONITOR,
		upsellId: 'site-monitoring',
		upsellIcon: chartBar,
		upsellTitle: __( 'Monitor server stats' ),
		upsellImage: <ThemedIllustration light={ illustrationUrl } dark={ illustrationDarkUrl } />,
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
