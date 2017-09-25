/**
 * External dependencies
 */
import { get } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import CheckoutData from 'components/data/checkout';
import { isValidFeatureKey } from 'lib/plans';
import { renderWithReduxStore } from 'lib/react-helpers';
import Plans from 'my-sites/plans/main';

export default {
	plans( context ) {
	    renderWithReduxStore(
			<CheckoutData>
				<Plans
					context={ context }
					intervalType={ context.params.intervalType }
					destinationType={ context.params.destinationType }
					selectedFeature={ context.query.feature }
				/>
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);
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
	}
};
