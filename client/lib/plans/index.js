/**
 * External dependencies
 */
import find from 'lodash/collection/find';
import page from 'page';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { addItem } from 'lib/upgrades/actions';
import { cartItems } from 'lib/cart-values';

export function addCurrentPlanToCartAndRedirect( sitePlans, selectedSite, event ) {
	event.preventDefault();

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

export function getDaysSinceTrialStarted( plan ) {
	const { subscribedDayMoment } = plan;

	return moment().startOf( 'day' ).diff( subscribedDayMoment, 'days' );
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
