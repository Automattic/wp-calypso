import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import AgencyTierOverviewContent from '../../overview-content';

import './style.scss';

export default function AgencyTierOverview() {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const title = translate( 'Your agency tier and benefits' );

	const currentAgencyTierId = agency?.tier?.id;
	const totalInfluencedRevenue = agency?.influenced_revenue ?? 0;
	const tierStatus = agency?.tier?.status ?? undefined;

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<AgencyTierOverviewContent
					currentAgencyTierId={ currentAgencyTierId }
					totalInfluencedRevenue={ totalInfluencedRevenue }
					tierStatus={ tierStatus }
				/>
			</LayoutBody>
		</Layout>
	);
}
