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
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import BillingSummary from 'calypso/jetpack-cloud/sections/partner-portal/billing-summary';
import BillingDetails from 'calypso/jetpack-cloud/sections/partner-portal/billing-details';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';

/**
 * Style dependencies
 */
import './style.scss';

export default function BillingDashboard(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout={ true } className="billing-dashboard">
			<SidebarNavigation sectionTitle={ translate( 'Billing' ) } />

			<div className="billing-dashboard__header">
				<CardHeading size={ 36 }>{ translate( 'Billing' ) }</CardHeading>

				<SelectPartnerKeyDropdown />
			</div>

			<BillingSummary />
			<BillingDetails />
		</Main>
	);
}
