import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import InvoicesList from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import './style.scss';

export default function InvoicesDashboard() {
	const translate = useTranslate();

	return (
		<Main fullWidthLayout className="invoices-dashboard">
			<DocumentHead title={ translate( 'Invoices' ) } />
			<SidebarNavigation />

			<div className="invoices-dashboard__header">
				<CardHeading size={ 36 }>{ translate( 'Invoices' ) }</CardHeading>

				<SelectPartnerKeyDropdown />
			</div>

			<InvoicesList />
		</Main>
	);
}
