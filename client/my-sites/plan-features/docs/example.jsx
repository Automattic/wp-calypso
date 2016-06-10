/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanFeaturesHeader from '../header';
import PlanFeaturesItem from '../item';
import PlanFeaturesItemList from '../list';
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
					<PlanFeaturesItemList>
						<PlanFeaturesItem>Free site</PlanFeaturesItem>
						<PlanFeaturesItem>WordPress.com subdomain</PlanFeaturesItem>
						<PlanFeaturesItem>Hundreds of free themes</PlanFeaturesItem>
						<PlanFeaturesItem>3GB of storage</PlanFeaturesItem>
						<PlanFeaturesItem>Community Support</PlanFeaturesItem>
					</PlanFeaturesItemList>
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
					<PlanFeaturesItemList>
						<PlanFeaturesItem>Free site</PlanFeaturesItem>
						<PlanFeaturesItem>Your custom domain</PlanFeaturesItem>
						<PlanFeaturesItem>Hundreds of free themes</PlanFeaturesItem>
						<PlanFeaturesItem>13GB of storage</PlanFeaturesItem>
						<PlanFeaturesItem>Email and live chat support</PlanFeaturesItem>
						<PlanFeaturesItem>No ads</PlanFeaturesItem>
						<PlanFeaturesItem>Advanced design customization</PlanFeaturesItem>
						<PlanFeaturesItem>VideoPress</PlanFeaturesItem>
					</PlanFeaturesItemList>
					<br />
				</div>
				<div>
					<PlanFeaturesHeader
						title={ plansList[ PLAN_BUSINESS ].getTitle() }
						planType={ PLAN_BUSINESS }
						price={ priceBusiness }
						billingTimeFrame={ 'per month, billed yearly' }
					/>
					<PlanFeaturesItemList>
						<PlanFeaturesItem>Free site</PlanFeaturesItem>
						<PlanFeaturesItem>Your custom domain</PlanFeaturesItem>
						<PlanFeaturesItem>Unlimited premium themes</PlanFeaturesItem>
						<PlanFeaturesItem>Unlimited storage</PlanFeaturesItem>
						<PlanFeaturesItem>Email and live chat support</PlanFeaturesItem>
						<PlanFeaturesItem>No ads</PlanFeaturesItem>
						<PlanFeaturesItem>Advanced design customization</PlanFeaturesItem>
						<PlanFeaturesItem>VideoPress</PlanFeaturesItem>
						<PlanFeaturesItem>Google Analytics</PlanFeaturesItem>
					</PlanFeaturesItemList>
				</div>
			</div>
		);
	}
} );
