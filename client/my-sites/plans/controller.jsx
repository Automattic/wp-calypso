/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Plans from './plans';
import { isValidFeatureKey } from 'lib/plans/features-list';

export function plans( context, next ) {
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
