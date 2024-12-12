import { useTranslate } from 'i18n-calypso';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import Layout from 'calypso/components/multi-site-dashboard/layout';
import LayoutBody from 'calypso/components/multi-site-dashboard/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/components/multi-site-dashboard/layout/header';
import LayoutTop from 'calypso/components/multi-site-dashboard/layout/top';
import InvoicesList from '../invoices-list';

import './style.scss';

export default function InvoicesOverview() {
	const translate = useTranslate();

	const title = translate( 'Invoices' );

	return (
		<Layout
			className="invoices-overview"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
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
