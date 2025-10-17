import { DotcomPlans, getPlanNames } from '@automattic/api-core';
import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import React from 'react';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationUrl from './upsell-illustration.svg';
import type { CalloutProps } from '../../components/callout/types';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

export interface UpsellCalloutProps {
	upsellIcon?: CalloutProps[ 'icon' ];
	upsellImage?: CalloutProps[ 'image' ];
	upsellTitle?: CalloutProps[ 'title' ];
	upsellTitleAs?: CalloutProps[ 'titleAs' ];
	upsellDescription?: CalloutProps[ 'description' ];
	feature?: HostingFeatureSlug;
}

export default function UpsellCallout( {
	site,
	tracksFeatureId,
	upsellIcon,
	upsellImage,
	upsellTitle,
	upsellTitleAs,
	upsellDescription,
	feature,
}: {
	site: Site;
	tracksFeatureId: string;
} & UpsellCalloutProps ) {
	const handleUpsellClick = () => {
		const backUrl = window.location.href.replace( window.location.origin, '' );

		window.location.href = addQueryArgs( '/setup/plan-upgrade/', {
			siteSlug: site.slug,
			cancel_to: backUrl,
			redirect_to: backUrl,
			...( feature && { feature } ),
		} );
	};

	const defaultProps = {
		icon: settings,
		image: illustrationUrl,
		title: __( 'Fine-tune your WordPress site' ),
		description: __(
			'Get under the hood—control caching, choose your PHP version, control security, and test out upcoming WordPress releases.'
		),
	};

	return (
		<Callout
			icon={ upsellIcon ?? defaultProps.icon }
			image={ upsellImage ?? defaultProps.image }
			title={ upsellTitle ?? defaultProps.title }
			titleAs={ upsellTitleAs }
			description={
				<>
					{ React.isValidElement( upsellDescription ) ? (
						upsellDescription
					) : (
						<Text variant="muted">{ upsellDescription ?? defaultProps.description }</Text>
					) }
					<Text variant="muted">
						{ sprintf(
							// translators: %(businessPlanName)s is the name of the Business plan, %(commercePlanName)s is the name of the Commerce plan
							__(
								'Available on the WordPress.com %(businessPlanName)s and %(commercePlanName)s plans.'
							),
							{
								businessPlanName: getPlanNames()[ DotcomPlans.BUSINESS ],
								commercePlanName: getPlanNames()[ DotcomPlans.ECOMMERCE ],
							}
						) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId={ tracksFeatureId }
					variant="primary"
					onClick={ handleUpsellClick }
				/>
			}
		/>
	);
}
