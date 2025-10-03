import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationUrl from './deployments-callout-illustration.svg';
import ghIconUrl from './icons/gh-icon.svg';
import type { Site } from '@automattic/api-core';

export function getDeploymentsCalloutProps() {
	return {
		tracksFeatureId: 'deployments',
		upsellIcon: <img src={ ghIconUrl } alt={ __( 'GitHub logo' ) } />,
		upsellTitle: __( 'Deploy from GitHub' ),
		upsellImage: illustrationUrl,
		upsellDescription: (
			<Text as="p" variant="muted">
				{ __(
					'Connect your GitHub repo directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
				) }
			</Text>
		),
	};
}

export function DeploymentsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<UpsellCallout
			{ ...getDeploymentsCalloutProps() }
			upsellTitleAs={ titleAs }
			site={ { slug: siteSlug } as Site }
		/>
	);
}
