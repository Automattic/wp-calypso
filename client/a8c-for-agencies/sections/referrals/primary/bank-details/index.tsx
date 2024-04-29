import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useGetTipaltiIFrameURL from '../../hooks/use-get-tipalti-iframe-url';

import './style.scss';

export default function ReferralsBankDetails() {
	const translate = useTranslate();

	const title = translate( 'Add bank details' );

	const { data, isFetching } = useGetTipaltiIFrameURL();

	const iFrameSrc = data?.iframe_url || '';

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
					{ isFetching ? (
						<TextPlaceholder />
					) : (
						<iframe width="100%" height="100%" src={ iFrameSrc } title={ title } />
					) }
				</div>
			</LayoutBody>
		</Layout>
	);
}
