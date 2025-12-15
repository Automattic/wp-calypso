import { DotcomPlans, getPlanNames } from '@automattic/api-core';
import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import React from 'react';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import illustrationUrl from './upsell-illustration.svg';
import type { CalloutProps } from '../../components/callout/types';
import type { HostingFeatureSlug, Site } from '@automattic/api-core';

export interface UpsellCalloutProps {
	site: Site;
	upsellId: string;
	upsellFeatureId?: string;
	upsellIcon?: CalloutProps[ 'icon' ];
	upsellImage?: CalloutProps[ 'image' ];
	upsellTitle?: CalloutProps[ 'title' ];
	upsellTitleAs?: CalloutProps[ 'titleAs' ];
	upsellDescription?: CalloutProps[ 'description' ];
	upsellPlanRequirement?: 'any' | 'business-or-commerce';
	feature?: HostingFeatureSlug;
}

export default function UpsellCallout( {
	site,
	upsellId,
	upsellFeatureId,
	upsellIcon,
	upsellImage,
	upsellTitle,
	upsellTitleAs,
	upsellDescription,
	upsellPlanRequirement = 'business-or-commerce',
	feature,
}: UpsellCalloutProps ) {
	const handleUpsellClick = () => {
		const backUrl = redirectToDashboardLink( { supportBackport: true } );

		window.location.href = addQueryArgs( wpcomLink( '/setup/plan-upgrade/' ), {
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
						{ upsellPlanRequirement === 'any'
							? __( 'Available on WordPress.com paid plans.' )
							: sprintf(
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
					variant="primary"
					onClick={ handleUpsellClick }
					upsellId={ upsellId }
					upsellFeatureId={ upsellFeatureId ?? upsellId }
				/>
			}
		/>
	);
}
