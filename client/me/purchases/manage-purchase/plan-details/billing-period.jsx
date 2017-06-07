/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal Dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { isMonthly, getYearlyPlanByMonthly } from 'lib/plans/constants';
import { planItem } from 'lib/cart-values/cart-items';
import { addItem } from 'lib/upgrades/actions';

class PlanBillingPeriod extends Component {
	static propTypes = {
		purchase: PropTypes.object,
	};

	handleBillingPeriodChange = ( event ) => {
		if ( event.target.value === 'monthly' ) {
			return;
		}

		const { purchase } = this.props;
		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.productSlug );
		if ( ! yearlyPlanSlug ) {
			return;
		}

		addItem( planItem( yearlyPlanSlug ) );
		page( '/checkout/' + purchase.domain );
	};

	renderBillingPeriodSelector() {
		const { purchase, translate } = this.props;
		if ( ! purchase ) {
			return;
		}

		if ( ! isMonthly( purchase.productSlug ) ) {
			return (
				<FormSettingExplanation>
					{ translate( 'yearly' ) }
				</FormSettingExplanation>
			);
		}

		return (
			<FormSelect onChange={ this.handleBillingPeriodChange } defaultValue="monthly">
				<option value="monthly">{ translate( 'monthly' ) }</option>
				<option value="yearly">{ translate( 'yearly' ) }</option>
			</FormSelect>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="plan-billing-period">
					{ translate( 'Billing period' ) }
				</FormLabel>

				{ this.renderBillingPeriodSelector() }
			</FormFieldset>
		);
	}
}

export default localize( PlanBillingPeriod );
