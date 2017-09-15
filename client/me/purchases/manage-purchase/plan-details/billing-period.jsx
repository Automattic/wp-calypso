/**
 * External Dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { isMonthly } from 'lib/plans/constants';
import { getYearlyPlanByMonthly } from 'lib/plans';
import { planItem } from 'lib/cart-values/cart-items';
import { addItem } from 'lib/upgrades/actions';
import {
	isExpired,
	isExpiring,
	isRenewing,
	showCreditCardExpiringWarning,
} from 'lib/purchases';
import { recordTracksEvent } from 'state/analytics/actions';

class PlanBillingPeriod extends Component {
	static propTypes = {
		purchase: PropTypes.object,
	};

	handleMonthlyToYearlyButtonClick = () => {
		const { purchase } = this.props;
		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.productSlug );

		addItem( planItem( yearlyPlanSlug ) );
		this.props.recordTracksEvent( 'calypso_purchase_details_plan_upgrade_click', {
			current_plan: purchase.productSlug,
			upgrading_to: yearlyPlanSlug,
		} );
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
				comment: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
			} );
		}

		return translate( 'Billed yearly' );
	}

	renderBillingPeriod() {
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

		const yearlyPlanSlug = getYearlyPlanByMonthly( purchase.productSlug );
		if ( ! yearlyPlanSlug ) {
			return;
		}

		return (
			<FormSettingExplanation>
				{ translate( 'Billed monthly' ) }
				<Button
					onClick={ this.handleMonthlyToYearlyButtonClick }
					primary
					compact
				>
					{ translate( 'Upgrade to yearly billing' ) }
				</Button>
			</FormSettingExplanation>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel htmlFor="plan-billing-period">
					{ translate( 'Billing period' ) }
				</FormLabel>

				{ this.renderBillingPeriod() }
			</FormFieldset>
		);
	}
}

export default connect(
	null,
	{
		recordTracksEvent
	}
)( localize( PlanBillingPeriod ) );
