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
import ReferHostingForm from './form';
import { getReferralConfig } from './lib/get-referral-config';
import type { ReferHostingType } from './types';

import './style.scss';

function ReferHosting( { type }: { type: ReferHostingType } ) {
	const translate = useTranslate();

	const config = getReferralConfig( translate, type );

	return (
		<Layout className="refer-hosting" title={ config.pageTitle } wide>
			<div className="refer-hosting__top">
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
									label: config.pageTitle,
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
				<ReferHostingForm config={ config } />
			</LayoutBody>
		</Layout>
	);
}

export default ReferHosting;
