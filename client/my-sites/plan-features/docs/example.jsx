/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanFeatures from '../';
import { PLAN_FREE, PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';
import QueryPlans from 'components/data/query-plans';

// TODO: use SelectDropdown to select currency.
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
				<QueryPlans />
				<PlanFeatures plan={ PLAN_FREE } /* onClick={ this.upgradePlan } */ />
				<PlanFeatures plan={ PLAN_PREMIUM } /* onClick={ this.upgradePlan } */ />
				<PlanFeatures plan={ PLAN_BUSINESS } /* onClick={ this.upgradePlan } */ />
			</div>
		);
	}
} );
