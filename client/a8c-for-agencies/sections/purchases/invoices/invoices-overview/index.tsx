import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import InvoicesList from '../invoices-list';

export default function InvoicesOverview() {
	const translate = useTranslate();

	const title = translate( 'Invoices' );

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<InvoicesList />
			</LayoutBody>
		</Layout>
	);
}
