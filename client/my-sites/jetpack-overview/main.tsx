import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { useEffect, useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ComparisonTable from './comparison-table';
import FeatureCard from './feature-card';
import {
	FEATURE_GROUPS,
	PLAN_DISPLAY_NAMES,
	PLAN_KEY_ORDER,
	PLAN_SLUGS,
	getPlanKey,
	getPlanTier,
} from './feature-data';
import type { PlanKey } from './feature-data';

import './style.scss';

const TOGGLE_PLANS: PlanKey[] = [ 'personal', 'premium', 'business' ];

export default function JetpackOverview() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const planTier = getPlanTier( currentPlan?.productSlug );
	const planKey = getPlanKey( planTier );
	const hasWooCommerce = Boolean( site?.options?.woocommerce_is_active );
	const businessTierIndex = PLAN_KEY_ORDER.indexOf( 'business' );
	const defaultPreviewKey: PlanKey = planTier >= businessTierIndex ? 'business' : planKey;
	const [ previewPlanKey, setPreviewPlanKey ] = useState< PlanKey >( defaultPreviewKey );

	useEffect( () => {
		setPreviewPlanKey( defaultPreviewKey );
	}, [ defaultPreviewKey ] );

	const isMaxPlan = planTier >= 4;
	useEffect( () => {
		recordTracksEvent( 'calypso_jetpack_interstitial_viewed', {
			site_id: site?.ID,
			plan_slug: currentPlan?.productSlug ?? 'free_plan',
		} );
	}, [ site?.ID, currentPlan?.productSlug ] );

	function handlePlanToggle( toggledPlanKey: PlanKey ) {
		setPreviewPlanKey( toggledPlanKey );
		recordTracksEvent( 'calypso_jetpack_interstitial_plan_preview_toggled', {
			site_id: site?.ID,
			current_plan: currentPlan?.productSlug ?? 'free_plan',
			preview_plan: toggledPlanKey,
		} );
	}

	function handleUpgradeClick() {
		recordTracksEvent( 'calypso_jetpack_interstitial_upgrade_clicked', {
			site_id: site?.ID,
			plan_slug: currentPlan?.productSlug ?? 'free_plan',
		} );
		page( `/upgrade-jetpack/${ siteSlug }` );
	}

	function handleTableCheckoutClick( targetPlanKey: PlanKey ) {
		recordTracksEvent( 'calypso_jetpack_interstitial_table_checkout_clicked', {
			site_id: site?.ID,
			plan_slug: currentPlan?.productSlug ?? 'free_plan',
			target_plan: targetPlanKey,
		} );
		window.location.href = `/checkout/${ siteSlug }/${ PLAN_SLUGS[ targetPlanKey ] }`;
	}

	function handleBack() {
		page( `/home/${ siteSlug }` );
	}

	return (
		<div className="jetpack-overview">
			<Button borderless className="jetpack-overview__back" onClick={ handleBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>
			<div className="jetpack-overview__header">
				<JetpackLogo size={ 40 } className="jetpack-overview__logo" />
				<div className="jetpack-overview__header-text">
					<h1 className="jetpack-overview__title">
						{ translate( 'Jetpack features on your site' ) }
					</h1>
					<p className="jetpack-overview__subtitle">
						{ previewPlanKey !== planKey
							? translate( 'Previewing {{strong}}%(previewPlanName)s{{/strong}} plan features.', {
									args: { previewPlanName: PLAN_DISPLAY_NAMES[ previewPlanKey ] },
									components: { strong: <strong /> },
							  } )
							: translate( 'Your site is on the {{strong}}%(planName)s{{/strong}} plan.', {
									args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
									components: { strong: <strong /> },
							  } ) }
					</p>
				</div>
				<div className="jetpack-overview__plan-toggles">
					{ TOGGLE_PLANS.map( ( key ) => (
						<button
							key={ key }
							className={ clsx( 'jetpack-overview__plan-toggle', {
								'is-active': previewPlanKey === key,
								'is-current': key === planKey,
							} ) }
							onClick={ () => handlePlanToggle( key ) }
						>
							{ PLAN_DISPLAY_NAMES[ key ] }
						</button>
					) ) }
				</div>
			</div>

			<div className="jetpack-overview__grid">
				{ FEATURE_GROUPS.map( ( group ) => (
					<FeatureCard
						key={ group.id }
						group={ group }
						planKey={ previewPlanKey }
						hasWooCommerce={ hasWooCommerce }
						siteSlug={ siteSlug ?? '' }
					/>
				) ) }
			</div>

			{ ! isMaxPlan && (
				<div className="jetpack-overview__upgrade-cta">
					<h2 className="jetpack-overview__upgrade-heading">
						{ translate( 'Unlock more Jetpack features' ) }
					</h2>
					<p className="jetpack-overview__upgrade-desc">
						{ translate(
							'Upgrade to access automated backups, malware scanning, advanced analytics, and more.'
						) }
					</p>
					<Button primary onClick={ handleUpgradeClick }>
						{ translate( 'See upgrade options' ) }
					</Button>
				</div>
			) }

			<ComparisonTable
				currentPlanKey={ planKey === 'commerce' ? 'business' : planKey }
				onUpgradeClick={ handleTableCheckoutClick }
				hasWooCommerce={ hasWooCommerce }
				siteSlug={ siteSlug ?? '' }
			/>
		</div>
	);
}
