import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import InvoicesList from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import Layout from '../../layout';
import LayoutBody from '../../layout/body';
import LayoutHeader from '../../layout/header';
import LayoutTop from '../../layout/top';

export default function InvoicesDashboard() {
	const translate = useTranslate();

	return (
		<Layout className="invoices-dashboard" title={ translate( 'Invoices' ) } wide>
			<LayoutTop>
				<LayoutHeader>
					<CardHeading size={ 36 }>{ translate( 'Invoices' ) }</CardHeading>

					<SelectPartnerKeyDropdown />
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<InvoicesList />
			</LayoutBody>
		</Layout>
	);
}
