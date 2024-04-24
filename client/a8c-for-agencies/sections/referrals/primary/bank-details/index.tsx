import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export default function ReferralsBankDetails() {
	const translate = useTranslate();

	const title = translate( 'Add bank details' );

	const iFrameSrc = '';

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<PageViewTracker title="Add bank details" path="/referrals/bank-details" />

			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label: translate( 'Referrals' ),
								href: A4A_REFERRALS_LINK,
							},
							{
								label: title,
							},
						] }
					/>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="bank-details__iframe-container">
					<iframe width="100%" src={ iFrameSrc } title={ title }></iframe>
				</div>
			</LayoutBody>
		</Layout>
	);
}
