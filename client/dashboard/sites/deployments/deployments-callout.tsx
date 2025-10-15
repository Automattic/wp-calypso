import { __ } from '@wordpress/i18n';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import illustrationUrl from './deployments-callout-illustration.svg';
import GithubIcon from './icons/github';
import type { Site } from '@automattic/api-core';

export function getDeploymentsCalloutProps() {
	return {
		tracksFeatureId: 'deployments',
		upsellIcon: <GithubIcon aria-label={ __( 'GitHub logo' ) } />,
		upsellTitle: __( 'Deploy from GitHub' ),
		upsellImage: illustrationUrl,
		upsellDescription: __(
			'Connect your GitHub repository directly to your WordPress.com site—with seamless integration, straightforward version control, and automated workflows.'
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
