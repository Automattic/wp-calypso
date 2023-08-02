import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import InvoicesList from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import Layout from '../../layout';
import LayoutHeader from '../../layout/header';

export default function InvoicesDashboard() {
	const translate = useTranslate();

	return (
		<Layout className="invoices-dashboard" title={ translate( 'Invoices' ) } wide>
			<LayoutHeader>
				<CardHeading size={ 36 }>{ translate( 'Invoices' ) }</CardHeading>

				<SelectPartnerKeyDropdown />
			</LayoutHeader>

			<InvoicesList />
		</Layout>
	);
}
