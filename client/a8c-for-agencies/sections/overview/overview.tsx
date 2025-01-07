import { gql, useQuery } from '@apollo/client';
import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { withGraphqlProvider } from 'calypso//a8c-for-agencies/api/apollo/hoc/with-graphql-provider';
import GraphiQLComponent from 'calypso/a8c-for-agencies/api/apollo/graphiql';
import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
import ContentSidebar from 'calypso/a8c-for-agencies/components/content-sidebar';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import OverviewBody from './body';
import OverviewHeaderActions from './header-actions';
import PartnerDirectoryOnboardingCard from './partner-directory-onboarding-card';
import OverviewSidebar from './sidebar';
import './style.scss';

const GET_USER = gql`
	query GetUser {
		me {
			id
			name
			email
			agency {
				id
				name
				users {
					id
					email
					role
					capabilities
				}
				referrals {
					id
					status
					client {
						id
						email
					}
					products {
						status
						product_id
						quantity
						site_assigned
						license {
							license_id
							license_key
							quantity
							issued_at
							attached_at
							revoked_at
						}
					}
				}
			}
		}
	}
`;

function Overview() {
	const translate = useTranslate();
	const title = translate( 'Agency Overview' );

	const { loading, error, data } = useQuery( GET_USER );

	console.log( { loading, error, data } ); // eslint-disable-line no-console

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<A4AAgencyApprovalNotice />
				<PressableUsageLimitNotice />
				<LayoutHeader className="a4a-overview-header">
					<Title>{ title }</Title>
					<Actions className="a4a-overview__header-actions">
						<MobileSidebarNavigation />
						<OverviewHeaderActions />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="a4a-overview-content">
				{ isEnabled( 'a4a-test-graphql' ) && <GraphiQLComponent /> }
				<ContentSidebar mainContent={ <OverviewBody /> } rightSidebar={ <OverviewSidebar /> } />
			</LayoutBody>

			<PartnerDirectoryOnboardingCard />
		</Layout>
	);
}

export default withGraphqlProvider( Overview );
