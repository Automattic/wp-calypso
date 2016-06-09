/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from '../header';
import { plansList, PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';

export default React.createClass( {

	displayName: 'PlanFeatures',

	mixins: [ PureRenderMixin ],

	render() {
		const priceFree = {
			currencySymbol: '$',
			decimalMark: '.',
			dollars: 0,
			cents: 0
		};
		const pricePremium = {
			currencySymbol: '$',
			decimalMark: '.',
			dollars: 8,
			cents: 25
		};
		const priceBusiness = {
			currencySymbol: '$',
			decimalMark: '.',
			dollars: 24,
			cents: 92
		};
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/plan-features">Plan Features</a>
				</h2>
				<div>
					<PlanFeaturesHeader
						current
						title={ plansList[ PLAN_FREE ].getTitle() }
						planType={ PLAN_FREE }
						price={ priceFree }
						billingTimeFrame={ 'for life' }
					/>
					<br />
				</div>
				<div>
					<PlanFeaturesHeader
						popular
						title={ plansList[ PLAN_PREMIUM ].getTitle() }
						planType={ PLAN_PREMIUM }
						price={ pricePremium }
						billingTimeFrame={ 'per month, billed yearly' }
					/>
					<br />
				</div>
				<div>
					<PlanFeaturesHeader
						title={ plansList[ PLAN_BUSINESS ].getTitle() }
						planType={ PLAN_BUSINESS }
						price={ priceBusiness }
						billingTimeFrame={ 'per month, billed yearly' }
					/>
				</div>
			</div>
		);
	}
} );
