import { HostingFeatures } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { ThemedIllustration } from '../../components/themed-illustration';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationDarkUrl from './logs-callout-illustration-dark.svg';
import illustrationUrl from './logs-callout-illustration.svg';
import type { Site } from '@automattic/api-core';
import type { JSX } from 'react';

export function getLogsCalloutProps() {
	return {
		feature: HostingFeatures.LOGS,
		upsellId: 'site-logs',
		upsellIcon: chartBar,
		upsellTitle: __( 'Access detailed logs' ),
		upsellImage: <ThemedIllustration light={ illustrationUrl } dark={ illustrationDarkUrl } />,
		upsellDescription: __(
			'Quickly identify and fix issues before they impact your visitors with full visibility into your site‘s web server logs and PHP errors.'
		),
	};
}

export function LogsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<UpsellCallout
			{ ...getLogsCalloutProps() }
			upsellTitleAs={ titleAs }
			site={ { slug: siteSlug } as Site }
		/>
	);
}
