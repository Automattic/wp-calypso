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
import withMarketplaceType from '../hoc/with-marketplace-type';

import './style.scss';

interface Props {
	isClient?: boolean;
	referralBlogId?: number;
}

function Checkout( { isClient }: Props ) {
	const translate = useTranslate();

	const title = translate( 'Checkout' );

	return (
		<Layout
			className="checkout"
			title={ title }
			wide
			withBorder={ ! isClient }
			sidebarNavigation={ ! isClient && <MobileSidebarNavigation /> }
		>
			{ isClient ? null : (
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
			) }
			<LayoutBody>
				<div>[ This is the Billing Dragon Checkout Page ]</div>
			</LayoutBody>
		</Layout>
	);
}

export default withMarketplaceType( Checkout );
