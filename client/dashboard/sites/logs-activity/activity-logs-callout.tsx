import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationUrl from './activity-logs-callout-illustration.svg';
import type { Site } from '@automattic/api-core';

export function getActivityLogsCalloutProps() {
	return {
		tracksFeatureId: 'logs-activity',
		upsellIcon: chartBar,
		upsellTitle: __( 'Track every action with Jetpack Activity' ),
		upsellImage: illustrationUrl,
		upsellDescription: (
			<Text as="p" variant="muted">
				{ __(
					'Debug issues faster with insights from a comprehensive audit log of all your admin activities.'
				) }
			</Text>
		),
	};
}

export function ActivityLogsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<UpsellCallout
			{ ...getActivityLogsCalloutProps() }
			upsellTitleAs={ titleAs }
			site={ { slug: siteSlug } as Site }
		/>
	);
}
