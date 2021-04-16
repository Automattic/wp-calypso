/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import BillingSummary from 'calypso/jetpack-cloud/sections/partner-portal/billing-summary';
import BillingDetails from 'calypso/jetpack-cloud/sections/partner-portal/billing-details';

export default function BillingDashboard(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout={ true } className="billing-dashboard">
			<CardHeading size={ 36 }>{ translate( 'Billing' ) }</CardHeading>

			<BillingSummary />
			<BillingDetails />
		</Main>
	);
}
