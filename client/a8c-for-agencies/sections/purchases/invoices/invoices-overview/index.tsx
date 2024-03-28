import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import InvoicesList from '../invoices-list';

export default function InvoicesOverview() {
	const translate = useTranslate();

	const title = translate( 'Invoices' );
	const isNarrowView = useBreakpoint( '<660px' );

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<PageViewTracker title="Purchases > Invoices" path="/purchases/invoices" />

			<LayoutTop>
				<LayoutHeader>
					{ ! isNarrowView && <Title>{ title } </Title> }
					{ /* TODO: <SHOW_PARTNER_KEY_SELECTION_HERE /> */ }
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<InvoicesList />
			</LayoutBody>
		</Layout>
	);
}
