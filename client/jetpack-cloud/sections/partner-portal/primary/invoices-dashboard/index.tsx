import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import InvoicesList from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import './style.scss';

export default function InvoicesDashboard(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="invoices-dashboard">
			<DocumentHead title={ translate( 'Billing' ) } />
			<SidebarNavigation />

			<div className="invoices-dashboard__header">
				<CardHeading size={ 36 }>{ translate( 'Past Invoices' ) }</CardHeading>

				<SelectPartnerKeyDropdown />
			</div>

			<InvoicesList />
		</Main>
	);
}
