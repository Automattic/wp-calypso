import { isFreePlan, isPersonalPlan, isPremiumPlan } from '@automattic/calypso-products';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { addQueryArgs } from 'calypso/lib/route';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSectionName } from 'calypso/state/ui/selectors';

import './style.scss';

const BusinessPlanBanner = () => {
	const { __ } = useI18n();
	const sectionName = useSelector( getSectionName );
	const selectedSite = useSelector( getSelectedSite );
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, selectedSite?.ID ) );

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugin_business_plan_banner_click', { section: sectionName } );
	}, [ sectionName ] );

	// Show for logged-out users (no planSlug) or users on Free, Personal, or Premium plans.
	const shouldShowBanner =
		! planSlug || isFreePlan( planSlug ) || isPersonalPlan( planSlug ) || isPremiumPlan( planSlug );

	if ( ! shouldShowBanner ) {
		return null;
	}

	const upgradeUrl = addQueryArgs( { ref: sectionName + '-lp' }, '/start/business' );

	return (
		<div className="business-plan-banner">
			<div className="business-plan-banner__content">
				<h2 className="business-plan-banner__title">{ __( 'Upgrade to Business class' ) }</h2>
				<p className="business-plan-banner__description">
					{ __( 'Get full control and priority support with our Business plan.' ) }
				</p>
				<ul className="business-plan-banner__features">
					<li>{ __( 'Use custom code, with SFTP/SSH, WP-CLI, and GitHub deployments' ) }</li>
					<li>{ __( 'Get priority 24/7 support from our expert team' ) }</li>
					<li>{ __( 'Peace of mind with real-time backups and one-click restores' ) }</li>
				</ul>
				<Button className="business-plan-banner__cta" href={ upgradeUrl } onClick={ trackClick }>
					{ __( 'Upgrade now' ) }
				</Button>
			</div>
			<div className="business-plan-banner__illustration-container">
				<img
					className="business-plan-banner__illustration"
					src="/calypso/images/plugins/business-plan-illustration.webp"
					alt=""
					aria-hidden="true"
				/>
			</div>
		</div>
	);
};

export default BusinessPlanBanner;
