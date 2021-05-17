/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getMonthlyPlanByYearly } from '@automattic/calypso-products';
import { getProductCost } from 'calypso/state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';

export default function SwitchToMonthlyStep() {
	const translate = useTranslate();
	const currentPlan = useSelector( ( state ) => getSitePlan( state, getSelectedSite( state ).ID ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const monthlyPlan = getMonthlyPlanByYearly( currentPlan.product_slug );
	const monthlyPlanCost = useSelector( ( state ) => getProductCost( state, monthlyPlan ) );
	const formattedMonthlyPlanCost = formatCurrency( monthlyPlanCost, currencyCode, {
		stripZeros: true,
	} );
	const refundTitle = translate( 'Would you rather pay as you go for your WordPress.com plan?' );
	const refundReason = translate(
		'While our Annual plans are the best value, we know it can be hard sometimes to pay for a full year all at once. ' +
			'That’s why we now offer monthly billing! ' +
			'You’ll be able to keep your website online and not lose any progress you’ve made by switching your %(planName)s subscription to our monthly plan at only %(formattedMonthlyPlanCost)s per month.',
		{
			args: {
				planName: currentPlan.product_name,
				formattedMonthlyPlanCost,
			},
		}
	);
	const refundDetails = translate(
		'Click on “Switch to Monthly” below to maintain your site and continue your WordPress.com subscription without any interruptions.'
	);
	return (
		<div>
			<FormSectionHeading>{ refundTitle }</FormSectionHeading>
			<FormFieldset>
				<p>{ refundReason }</p>
				<p>{ refundDetails }</p>
			</FormFieldset>
		</div>
	);
}
