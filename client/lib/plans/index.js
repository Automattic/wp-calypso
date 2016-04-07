/**
 * External dependencies
 */
import find from 'lodash/find';
import page from 'page';
import moment from 'moment';
import get from 'lodash/get';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { addItem } from 'lib/upgrades/actions';
import { cartItems } from 'lib/cart-values';
import {
	isFreeJetpackPlan,
	isJetpackPlan
} from 'lib/products-values';
import { featuresList } from './constants';
import SitesList from 'lib/sites-list';
const sitesList = SitesList();

export function getValidFeatureKeys() {
	return Object.keys( featuresList );
}

export function getSitePlanSlug( siteID ) {
	var site;
	if ( siteID ) {
		site = sitesList.getSite( siteID );
	} else {
		site = sitesList.getSelectedSite();
	}
	return get( site, 'plan.product_slug' );
}

export function hasFeature( feature, siteID ) {
	if ( ! featuresList[ feature ] ) {
		return false;
	}
	const plan = getSitePlanSlug( siteID );
	return includes( featuresList[ feature ].plans, plan );
}

export function addCurrentPlanToCartAndRedirect( sitePlans, selectedSite ) {
	addItem( cartItems.planItem( getCurrentPlan( sitePlans.data ).productSlug ) );

	page( `/checkout/${ selectedSite.slug }` );
}

export function getCurrentPlan( plans ) {
	return find( plans, { currentPlan: true } );
}

export function getCurrentTrialPeriodInDays( plan ) {
	const { expiryMoment, subscribedDayMoment, userFacingExpiryMoment } = plan;

	if ( isInGracePeriod( plan ) ) {
		return expiryMoment.diff( userFacingExpiryMoment, 'days' );
	}

	return userFacingExpiryMoment.diff( subscribedDayMoment, 'days' );
};

export function getDayOfTrial( plan ) {
	const { subscribedDayMoment } = plan;

	// we return the difference plus one day so that the first day is day 1 instead of day 0
	return moment().startOf( 'day' ).diff( subscribedDayMoment, 'days' ) + 1;
};

export function getDaysUntilUserFacingExpiry( plan ) {
	const { userFacingExpiryMoment } = plan;

	return userFacingExpiryMoment.diff( moment().startOf( 'day' ), 'days' );
};

export function getDaysUntilExpiry( plan ) {
	const { expiryMoment } = plan;

	return expiryMoment.diff( moment().startOf( 'day' ), 'days' );
};

export function isInGracePeriod( plan ) {
	return getDaysUntilUserFacingExpiry( plan ) <= 0;
};

export function shouldFetchSitePlans( sitePlans, selectedSite ) {
	return ! sitePlans.hasLoadedFromServer && ! sitePlans.isRequesting && selectedSite;
};

export function filterPlansBySiteAndProps( plans, site, hideFreePlan ) {
	return plans.filter( function( plan ) {
		if ( site && site.jetpack ) {
			return isJetpackPlan( plan ) && ! isFreeJetpackPlan( plan );
		}

		if ( hideFreePlan && 'free_plan' === plan.product_slug ) {
			return false;
		}

		return ! isJetpackPlan( plan );
	} );
};
