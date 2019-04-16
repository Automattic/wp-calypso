/** @format */

/**
 * External dependencies
 */

import page from 'page';
import React from 'react';

import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { isValidFeatureKey } from 'lib/plans/features-list';
import Plans from './plans';
import CheckoutData from 'components/data/checkout';

export default {
	plans( context, next ) {
		context.primary = (
			<CheckoutData>
				<Plans
					context={ context }
					intervalType={ context.params.intervalType }
					customerType={ context.query.customerType }
					selectedFeature={ context.query.feature }
					selectedPlan={ context.query.plan }
					withDiscount={ context.query.discount }
				/>
			</CheckoutData>
		);
		next();
	},

	features( context ) {
		const domain = context.params.domain;
		const feature = get( context, 'params.feature' );
		let comparePath = domain ? `/plans/${ domain }` : '/plans/';

		if ( isValidFeatureKey( feature ) ) {
			comparePath += '?feature=' + feature;
		}

		// otherwise redirect to the compare page if not found
		page.redirect( comparePath );
	},

	redirectToCheckout( context ) {
		// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
		page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
	},

	redirectToPlans( context ) {
		const siteDomain = context.params.domain;

		if ( siteDomain ) {
			return page.redirect( `/plans/${ siteDomain }` );
		}

		return page.redirect( '/plans' );
	},
};
