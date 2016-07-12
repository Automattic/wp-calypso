/**
 * External dependencies
 */
import page from 'page';
import moment from 'moment';
import debugFactory from 'debug';
import {
	pick,
	pickBy,
	find,
	get,
	includes,
	invoke
} from 'lodash';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { isEnabled } from 'config';
import { addItem } from 'lib/upgrades/actions';
import { cartItems } from 'lib/cart-values';
import {
	isFreeJetpackPlan,
	isJetpackPlan,
	isMonthly
} from 'lib/products-values';
import {
	featuresList,
	plansList,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	FEATURE_WORDADS_INSTANT,
	FEATURE_GOOGLE_AD_CREDITS
} from 'lib/plans/constants';
import { createSitePlanObject } from 'state/sites/plans/assembler';
import SitesList from 'lib/sites-list';

/**
 * Module vars
 */
const sitesList = SitesList();
const debug = debugFactory( 'calypso:plans' );

export function getPlan( plan ) {
	return plansList[ plan ];
}

export function getValidFeatureKeys() {
	return Object.keys( featuresList );
}

export function isValidFeatureKey( feature ) {
	return !! featuresList[ feature ];
}

export function getFeatureByKey( feature ) {
	return featuresList[ feature ];
}

export function getFeatureTitle( feature ) {
	return invoke( featuresList, [ feature, 'getTitle' ] );
}

export function getSitePlanSlug( siteID ) {
	let site;
	if ( siteID ) {
		site = sitesList.getSite( siteID );
	} else {
		site = sitesList.getSelectedSite();
	}
	return get( site, 'plan.product_slug' );
}

export function canUpgradeToPlan( planKey, site = sitesList.getSelectedSite() ) {
	const plan = get( site, [ 'plan', 'expired' ], false ) ? PLAN_FREE : get( site, [ 'plan', 'product_slug' ], PLAN_FREE );
	return get( plansList, [ planKey, 'availableFor' ], () => false )( plan );
}

export function getUpgradePlanSlugFromPath( path, siteID ) {
	const site = siteID ? sitesList.getSite( siteID ) : sitesList.getSelectedSite();
	return find( Object.keys( plansList ), planKey => (
		( planKey === path || getPlanPath( planKey ) === path ) &&
		canUpgradeToPlan( planKey, site )
	) );
}

export function getPlanPath( plan ) {
	return get( plansList, [ plan, 'getPathSlug' ], () => undefined )();
}

export function planHasFeature( plan, feature ) {
	return includes( get( featuresList, [ feature, 'plans' ] ), plan );
}

export function hasFeature( feature, siteID ) {
	return planHasFeature( getSitePlanSlug( siteID ), feature );
}

export function addCurrentPlanToCartAndRedirect( sitePlans, selectedSite ) {
	addItem( cartItems.planItem( getCurrentPlan( sitePlans.data ).productSlug ) );

	page( `/checkout/${ selectedSite.slug }` );
}

export function getCurrentPlan( plans ) {
	const currentPlan = find( plans, { currentPlan: true } );

	if ( currentPlan ) {
		debug( 'current plan: %o', currentPlan );
		return currentPlan;
	}

	// get Site plan from the `site` data
	const site = sitesList.getSelectedSite();
	const plan = createSitePlanObject( site.plan );
	debug( 'current plan: %o', plan );
	return plan;
}

export function getCurrentTrialPeriodInDays( plan ) {
	const { expiryMoment, subscribedDayMoment, userFacingExpiryMoment } = plan;

	if ( isInGracePeriod( plan ) ) {
		return expiryMoment.diff( userFacingExpiryMoment, 'days' );
	}

	return userFacingExpiryMoment.diff( subscribedDayMoment, 'days' );
}

export function getDayOfTrial( plan ) {
	const { subscribedDayMoment } = plan;

	// we return the difference plus one day so that the first day is day 1 instead of day 0
	return moment().startOf( 'day' ).diff( subscribedDayMoment, 'days' ) + 1;
}

export function getDaysUntilUserFacingExpiry( plan ) {
	const { userFacingExpiryMoment } = plan;

	return userFacingExpiryMoment.diff( moment().startOf( 'day' ), 'days' );
}

export function getDaysUntilExpiry( plan ) {
	const { expiryMoment } = plan;

	return expiryMoment.diff( moment().startOf( 'day' ), 'days' );
}

export function isInGracePeriod( plan ) {
	return getDaysUntilUserFacingExpiry( plan ) <= 0;
}

export function shouldFetchSitePlans( sitePlans, selectedSite ) {
	return ! sitePlans.hasLoadedFromServer && ! sitePlans.isRequesting && selectedSite;
}

export function filterPlansBySiteAndProps( plans, site, hideFreePlan, intervalType, showJetpackFreePlan ) {
	const hasPersonalPlan = site && site.plan.product_slug === PLAN_PERSONAL;
	const personalPlanTestEnabled = abtest( 'personalPlan' ) === 'show' && isEnabled( 'plans/personal-plan' );

	return plans.filter( function( plan ) {
		if ( site && site.jetpack ) {
			if ( 'monthly' === intervalType ) {
				if ( showJetpackFreePlan ) {
					return isJetpackPlan( plan ) && isMonthly( plan );
				}
				return isJetpackPlan( plan ) && ! isFreeJetpackPlan( plan ) && isMonthly( plan );
			}

			if ( showJetpackFreePlan ) {
				return isJetpackPlan( plan ) && ! isMonthly( plan );
			}

			return isJetpackPlan( plan ) && ! isFreeJetpackPlan( plan ) && ! isMonthly( plan );
		}

		if ( hideFreePlan && PLAN_FREE === plan.product_slug ) {
			return false;
		}

		if ( plan.product_slug === PLAN_PERSONAL && ! ( hasPersonalPlan || personalPlanTestEnabled ) ) {
			return false;
		}

		return ! isJetpackPlan( plan );
	} );
}

export const isWordadsInstantActivationEnabled = () => {
	return isEnabled( 'manage/ads/wordads-instant' ) &&
		abtest( 'wordadsInstantActivation' ) === 'enabled';
};

export const isGoogleVouchersEnabled = () => {
	return ( isEnabled( 'google-voucher' ) && abtest( 'googleVouchers' ) === 'enabled' );
};

export const isWordpressAdCreditsEnabled = () => {
	return (
		isGoogleVouchersEnabled() &&
		isEnabled( 'plans/wordpress-ad-credits' ) &&
		abtest( 'wordpressAdCredits' ) === 'enabled'
	);
};

export function plansLink( url, site, intervalType ) {
	if ( 'monthly' === intervalType ) {
		url += '/monthly';
	}

	if ( site ) {
		url += '/' + site.slug;
	}

	return url;
}

export function applyTestFiltersToPlansList( planName ) {
	const filteredPlanConstantObj = { ...plansList[ planName ] };
	let filteredPlanFeaturesConstantObj = pick( featuresList, plansList[ planName ].getFeatures() );

	const removeDisabledFeatures = () => {
		if ( ! isWordadsInstantActivationEnabled() ) {
			filteredPlanFeaturesConstantObj = pickBy( filteredPlanFeaturesConstantObj,
				( value, key ) => key !== FEATURE_WORDADS_INSTANT
			);
		}
		if ( ! isGoogleVouchersEnabled() ) {
			filteredPlanFeaturesConstantObj = pickBy( filteredPlanFeaturesConstantObj,
				( value, key ) => key !== FEATURE_GOOGLE_AD_CREDITS
			);
		}
	};

	const updatePlanDescriptions = () => {
		if ( isWordadsInstantActivationEnabled() && isGoogleVouchersEnabled() && planName === PLAN_PREMIUM ) {
			filteredPlanConstantObj.getDescription = plansList[ planName ].getDescriptionWithWordAdsInstantActivationAndGoogleVouchers;
		} else if ( isWordadsInstantActivationEnabled() && planName === PLAN_PREMIUM ) {
			filteredPlanConstantObj.getDescription = plansList[ planName ].getDescriptionWithWordAdsInstantActivation;
		} else if ( isGoogleVouchersEnabled() && planName === PLAN_PREMIUM ) {
			filteredPlanConstantObj.getDescription = plansList[ planName ].getDescriptionWithGoogleVouchers;
		} else if ( isWordpressAdCreditsEnabled() && planName === PLAN_BUSINESS ) {
			filteredPlanConstantObj.getDescription = plansList[ planName ].getDescriptionWithWordAdsCredit;
		}
	};

	const updateInfoPopups = () => {
		if ( isWordpressAdCreditsEnabled() && planName === PLAN_BUSINESS	) {
			filteredPlanFeaturesConstantObj[ FEATURE_GOOGLE_AD_CREDITS ].getDescription =
			featuresList[ FEATURE_GOOGLE_AD_CREDITS ].getDescriptionWithWordAdsCredit;
		}
	};

	removeDisabledFeatures();
	updatePlanDescriptions();
	updateInfoPopups();

	filteredPlanConstantObj.getFeatures = () => filteredPlanFeaturesConstantObj;

	return filteredPlanConstantObj;
}

export const isSkipPlansTestEnabled = () => {
	return isEnabled( 'plans/skip-plans-for-free' ) &&
		isEnabled( 'plans/personal-plan' ) &&
		abtest( 'personalPlan' ) === 'show' &&
		abtest( 'skipPlansLinkForFree' ) === 'skipPlansForFree';
};
