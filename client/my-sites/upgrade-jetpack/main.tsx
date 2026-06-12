import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	FEATURE_GROUPS,
	PLAN_DISPLAY_NAMES,
	PLAN_KEY_ORDER,
	PLAN_SLUGS,
	getPlanKey,
	getPlanTier,
} from '../jetpack-overview/feature-data';
import type { Feature, FeatureGroup, PlanKey } from '../jetpack-overview/feature-data';

import './style.scss';

const TARGET_PLANS: PlanKey[] = [ 'personal', 'premium', 'business' ];

const PLAN_TAGLINES: Record< string, string > = {
	personal: 'Essential tools for creators',
	premium: 'Advanced security and media',
	business: 'Full professional protection',
};

function getUnlockedByGroup(
	planKey: PlanKey,
	hasWooCommerce: boolean
): { group: FeatureGroup; features: Feature[] }[] {
	const tierIndex = PLAN_KEY_ORDER.indexOf( planKey );
	if ( tierIndex <= 0 ) {
		return [];
	}
	const previousKey = PLAN_KEY_ORDER[ tierIndex - 1 ];
	return FEATURE_GROUPS.map( ( group ) => ( {
		group,
		features: group.features.filter(
			( f ) =>
				( ! f.requiresWooCommerce || hasWooCommerce ) &&
				f.plans[ previousKey ] === 'none' &&
				f.plans[ planKey ] !== 'none'
		),
	} ) ).filter( ( g ) => g.features.length > 0 );
}

export default function UpgradeJetpack() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );

	const currentTier = getPlanTier( currentPlan?.productSlug );
	const currentPlanKey = getPlanKey( currentTier );
	const hasWooCommerce = Boolean( site?.options?.woocommerce_is_active );

	useEffect( () => {
		recordTracksEvent( 'calypso_upgrade_jetpack_viewed', {
			site_id: site?.ID,
			current_plan_slug: currentPlan?.productSlug ?? 'free_plan',
		} );
	}, [ site?.ID, currentPlan?.productSlug ] );

	function handleBack() {
		page( `/jetpack-features/${ siteSlug }` );
	}

	function handleCheckoutClick( planKey: PlanKey ) {
		recordTracksEvent( 'calypso_upgrade_jetpack_checkout_clicked', {
			site_id: site?.ID,
			current_plan_slug: currentPlan?.productSlug ?? 'free_plan',
			target_plan_slug: PLAN_SLUGS[ planKey ],
		} );
		window.location.href = `/checkout/${ siteSlug }/${ PLAN_SLUGS[ planKey ] }`;
	}

	if ( currentTier >= 3 ) {
		return (
			<div className="upgrade-jetpack upgrade-jetpack--all-active">
				<Button borderless className="upgrade-jetpack__back" onClick={ handleBack }>
					<Gridicon icon="arrow-left" size={ 18 } />
					{ translate( 'Back' ) }
				</Button>
				<h1 className="upgrade-jetpack__title">
					{ translate( 'You have every Jetpack feature' ) }
				</h1>
				<p className="upgrade-jetpack__subtitle">
					{ translate( 'Your %(planName)s plan includes the full Jetpack feature set.', {
						args: { planName: PLAN_DISPLAY_NAMES[ currentPlanKey ] },
					} ) }
				</p>
			</div>
		);
	}

	return (
		<div className="upgrade-jetpack">
			<Button borderless className="upgrade-jetpack__back" onClick={ handleBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Back' ) }
			</Button>

			<div className="upgrade-jetpack__header">
				<h1 className="upgrade-jetpack__title">{ translate( 'Unlock more Jetpack features' ) }</h1>
				<p className="upgrade-jetpack__subtitle">
					{ translate(
						"You're on the %(planName)s plan. Choose a plan to unlock additional Jetpack tools.",
						{ args: { planName: PLAN_DISPLAY_NAMES[ currentPlanKey ] } }
					) }
				</p>
			</div>

			<div className="upgrade-jetpack__grid">
				{ TARGET_PLANS.map( ( planKey ) => {
					const isCurrent = planKey === currentPlanKey;
					const isPopular = planKey === 'business';
					const unlockedGroups = getUnlockedByGroup( planKey, hasWooCommerce );

					return (
						<div
							key={ planKey }
							className={ `upgrade-jetpack__plan${ isCurrent ? ' is-current' : '' }` }
						>
							<div className="upgrade-jetpack__plan-name">{ PLAN_DISPLAY_NAMES[ planKey ] }</div>
							<p className="upgrade-jetpack__plan-tagline">{ PLAN_TAGLINES[ planKey ] }</p>

							{ unlockedGroups.length > 0 ? (
								<div className="upgrade-jetpack__unlocks">
									<p className="upgrade-jetpack__unlocks-label">
										{ translate( 'New with this plan:' ) }
									</p>
									{ unlockedGroups.map( ( { group, features } ) => (
										<div key={ group.id } className="upgrade-jetpack__unlock-group">
											<div className="upgrade-jetpack__unlock-group-header">
												{ group.gridicon ? (
													<Gridicon
														icon={ group.gridicon }
														size={ 18 }
														className="upgrade-jetpack__unlock-icon"
													/>
												) : (
													<img
														src={ group.iconSrc }
														alt=""
														width={ 20 }
														height={ 20 }
														className="upgrade-jetpack__unlock-icon"
													/>
												) }
												<span className="upgrade-jetpack__unlock-group-name">{ group.name }</span>
											</div>
											<ul className="upgrade-jetpack__unlock-list">
												{ features.map( ( f ) => (
													<li key={ f.id }>
														{ f.name }
														{ f.description.length <= 20 && (
															<span className="upgrade-jetpack__unlock-note">
																{ f.description }
															</span>
														) }
													</li>
												) ) }
											</ul>
										</div>
									) ) }
								</div>
							) : (
								<div className="upgrade-jetpack__unlocks">
									<p className="upgrade-jetpack__unlocks-label">
										{ translate( 'All Jetpack features already included' ) }
									</p>
								</div>
							) }

							{ isCurrent ? (
								<div className="upgrade-jetpack__current-label">
									{ translate( 'Your current plan' ) }
								</div>
							) : (
								<Button
									primary={ isPopular }
									className="upgrade-jetpack__cta"
									onClick={ () => handleCheckoutClick( planKey ) }
								>
									{ translate( 'Upgrade to %(planName)s', {
										args: { planName: PLAN_DISPLAY_NAMES[ planKey ] },
									} ) }
								</Button>
							) }
						</div>
					);
				} ) }
			</div>
		</div>
	);
}
