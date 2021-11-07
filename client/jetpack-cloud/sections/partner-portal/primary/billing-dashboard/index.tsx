import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import BillingDetails from 'calypso/jetpack-cloud/sections/partner-portal/billing-details';
import BillingSummary from 'calypso/jetpack-cloud/sections/partner-portal/billing-summary';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import './style.scss';

export default function BillingDashboard(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="billing-dashboard">
			<DocumentHead title={ translate( 'Billing' ) } />
			<SidebarNavigation />

			<div className="billing-dashboard__header">
				<CardHeading size={ 36 }>{ translate( 'Billing' ) }</CardHeading>

				<SelectPartnerKeyDropdown />
			</div>

			<BillingSummary />
			<BillingDetails />
		</Main>
	);
}
