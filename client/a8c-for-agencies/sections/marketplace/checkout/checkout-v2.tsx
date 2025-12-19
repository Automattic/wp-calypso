import { useTranslate } from 'i18n-calypso';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import BillingDragonCheckout from '../billing-dragon-checkout';
import withMarketplaceProviders from '../hoc/with-marketplace-providers';
import useShoppingCart from '../hooks/use-shopping-cart';

import './style-v2.scss';

function CheckoutV2() {
	const translate = useTranslate();

	const { selectedCartItems } = useShoppingCart();

	const title = translate( 'Checkout' );

	return (
		<Layout
			className="checkout"
			title={ title }
			withBorder
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<A4AAgencyApprovalNotice />
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label: translate( 'Marketplace' ),
								href: A4A_MARKETPLACE_LINK,
							},
							{
								label: title,
							},
						] }
					/>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<BillingDragonCheckout withA8cLogo={ false } cartItems={ selectedCartItems } />
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceProviders( CheckoutV2 );
