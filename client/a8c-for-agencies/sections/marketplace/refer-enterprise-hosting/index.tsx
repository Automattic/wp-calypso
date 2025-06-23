import { useTranslate } from 'i18n-calypso';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import ReferEnterpriseHostingForm from './form';

import './style.scss';

export function ReferEnterpriseHosting() {
	const translate = useTranslate();

	return (
		<Layout
			className="refer-enterprise-hosting"
			title={ translate( 'Refer Enterprise Hosting' ) }
			wide
		>
			<div className="refer-enterprise-hosting__top">
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
									label: translate( 'Hosting' ),
									href: A4A_MARKETPLACE_HOSTING_LINK,
								},
								{
									label: translate( 'Refer Enterprise Hosting' ),
								},
							] }
							hideOnMobile
						/>

						<Actions>
							<MobileSidebarNavigation />
						</Actions>
					</LayoutHeader>
				</LayoutTop>
			</div>

			<LayoutBody>
				<ReferEnterpriseHostingForm />
			</LayoutBody>
		</Layout>
	);
}

export default ReferEnterpriseHosting;
