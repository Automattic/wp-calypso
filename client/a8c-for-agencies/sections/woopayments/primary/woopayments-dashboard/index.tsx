import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AddWooPaymentsToSite from '../../add-woopayments-to-site';

const WooPaymentsDashboard = () => {
	const translate = useTranslate();

	const title = translate( 'WooPayments Commissions' );

	const showEmptyState = false;

	if ( showEmptyState ) {
		// TODO: Add the empty state
	}

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<AddWooPaymentsToSite />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<>{ /* TODO: Add the content */ }</>
			</LayoutBody>
		</Layout>
	);
};

export default WooPaymentsDashboard;
