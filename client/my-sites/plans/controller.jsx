/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get, omit } from 'lodash';

/**
 * Internal Dependencies
 */
import Plans from './plans';
import { isValidFeatureKey } from 'lib/plans/features-list';
import { getSelectedSite } from 'state/ui/selectors';

export function plans( context, next ) {
	// Users coming from signing up should see the checkout page. The signup flow redirects to the plans page
	// assuming it will end up redirecting to the checkout page. This is a way of reducing the number of duplicate
	// sites when users go back in the browser trying to change a plan during checkout.
	// See https://github.com/Automattic/wp-calypso/issues/39424
	const isComingFromSignUp = !! context.query.signup;
	if ( isComingFromSignUp ) {
		// Removes the signup query param so users going back to plans are not redirected to checkout again.
		page.replace(
			context.pathname,
			{
				...context.state,
				query: omit( context.query, 'signup' ),
			},
			false,
			false
		);

		const selectedSite = getSelectedSite( context.store.getState() );
		return page.show( `/checkout/${ selectedSite.slug }?signup=1`, context.state );
	}

	context.primary = (
		<Plans
			context={ context }
			intervalType={ context.params.intervalType }
			customerType={ context.query.customerType }
			selectedFeature={ context.query.feature }
			selectedPlan={ context.query.plan }
			withDiscount={ context.query.discount }
			discountEndDate={ context.query.ts }
			redirectTo={ context.query.redirect_to }
		/>
	);
	next();
}

export function features( context ) {
	const domain = context.params.domain;
	const feature = get( context, 'params.feature' );
	let comparePath = domain ? `/plans/${ domain }` : '/plans/';

	if ( isValidFeatureKey( feature ) ) {
		comparePath += '?feature=' + feature;
	}

	// otherwise redirect to the compare page if not found
	page.redirect( comparePath );
}

export function redirectToCheckout( context ) {
	// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
	page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
}

export function redirectToPlans( context ) {
	const siteDomain = context.params.domain;

	if ( siteDomain ) {
		return page.redirect( `/plans/${ siteDomain }` );
	}

	return page.redirect( '/plans' );
}
