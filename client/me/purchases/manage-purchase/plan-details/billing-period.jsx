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
import {
	isExpired,
	isExpiring,
	isRenewing,
	showCreditCardExpiringWarning,
} from 'lib/purchases';

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

	renderYearlyBillingInformation() {
		const { purchase, translate } = this.props;

		if ( showCreditCardExpiringWarning( purchase ) ) {
			return translate( 'Billed yearly, credit card expiring soon' );
		}

		if ( isRenewing( purchase ) ) {
			return translate( 'Billed yearly, renews on %s', {
				args: purchase.renewMoment.format( 'LL' ),
			} );
		}

		if ( isExpiring( purchase ) ) {
			return translate( 'Billed yearly, expires on %s', {
				args: purchase.expiryMoment.format( 'LL' ),
			} );
		}

		if ( isExpired( purchase ) ) {
			return translate( 'Billed yearly, expired %(timeSinceExpiry)s', {
				args: {
					timeSinceExpiry: purchase.expiryMoment.fromNow(),
				},
				context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			} );
		}

		return translate( 'Billed yearly' );
	}

	renderBillingPeriodSelector() {
		const { purchase, translate } = this.props;
		if ( ! purchase ) {
			return;
		}

		if ( ! isMonthly( purchase.productSlug ) ) {
			return (
				<FormSettingExplanation>
					{ this.renderYearlyBillingInformation() }
				</FormSettingExplanation>
			);
		}

		return (
			<FormSelect onChange={ this.handleBillingPeriodChange } defaultValue="monthly">
				<option value="monthly">{ translate( 'Monthly' ) }</option>
				<option value="yearly">{ translate( 'Yearly' ) }</option>
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
