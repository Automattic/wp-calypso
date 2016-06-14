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
import PlanFeaturesFooter from '../footer';
import { plansList, PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';
import SelectDropdown from 'components/select-dropdown';

const options = [
	{ value: 'USD', label: 'USD' },
	{ value: 'AUD', label: 'AUD' },
	{ value: 'CAD', label: 'CAD' },
	{ value: 'EUR', label: 'EUR' },
	{ value: 'GBP', label: 'GBP' },
	{ value: 'JPY', label: 'JPY' }
];

const currencyData = {
	USD: {
		currencyCode: 'USD',
		free: 0,
		premium: 99 / 12,
		business: 299 / 12
	},
	AUD: {
		currencyCode: 'AUD',
		free: 0,
		premium: 129 / 12,
		business: 399 / 12
	},
	CAD: {
		currencyCode: 'CAD',
		free: 0,
		premium: 129 / 12,
		business: 389 / 12
	},
	EUR: {
		currencyCode: 'EUR',
		free: 0,
		premium: 99 / 12,
		business: 299 / 12
	},
	GBP: {
		currencyCode: 'GBP',
		free: 0,
		premium: 85 / 12,
		business: 250 / 12
	},
	JPY: {
		currencyCode: 'JPY',
		free: 0,
		premium: 11800 / 12,
		business: 35800 / 12
	}
};

export default React.createClass( {

	displayName: 'PlanFeatures',

	mixins: [ PureRenderMixin ],

	onDropdownSelect( selected ) {
		this.setState( { currency: selected.value } );
	},

	getInitialState() {
		return {
			currency: 'USD'
		};
	},

	render() {
		const priceData = currencyData[ this.state.currency ];

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/plan-features">Plan Features</a>

				</h2>
				<div>
					<SelectDropdown
						options={ options }
						onSelect={ this.onDropdownSelect } />
					<br />
				</div>
				<div>
					<PlanFeaturesHeader
						current
						title={ plansList[ PLAN_FREE ].getTitle() }
						planType={ PLAN_FREE }
						rawPrice={ priceData.free }
						currencyCode={ priceData.currencyCode }
						billingTimeFrame={ 'for life' }
					/>
					<PlanFeaturesItemList>
						<PlanFeaturesItem>Free site</PlanFeaturesItem>
						<PlanFeaturesItem>WordPress.com subdomain</PlanFeaturesItem>
						<PlanFeaturesItem>Hundreds of free themes</PlanFeaturesItem>
						<PlanFeaturesItem>3GB of storage</PlanFeaturesItem>
						<PlanFeaturesItem>Community Support</PlanFeaturesItem>
					</PlanFeaturesItemList>
					<PlanFeaturesFooter
						current
						description={ 'Get a free blog and be on your way to publishing your first post in less' +
							' than five minutes.' }
					/>
					<br />
				</div>
				<div>
					<PlanFeaturesHeader
						popular
						title={ plansList[ PLAN_PREMIUM ].getTitle() }
						planType={ PLAN_PREMIUM }
						rawPrice={ priceData.premium }
						currencyCode={ priceData.currencyCode }
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
					<PlanFeaturesFooter
						description={ 'Your own domain name, powerful customization options, and lots of space' +
							' for audio and video.' }
					/>
					<br />
				</div>
				<div>
					<PlanFeaturesHeader
						title={ plansList[ PLAN_BUSINESS ].getTitle() }
						planType={ PLAN_BUSINESS }
						rawPrice={ priceData.business }
						currencyCode={ priceData.currencyCode }
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
					<PlanFeaturesFooter
						description={ 'Everything included with Premium, as well as live chat support,' +
							' and unlimited access to our premium themes.' }
					/>
				</div>
			</div>
		);
	}
} );
