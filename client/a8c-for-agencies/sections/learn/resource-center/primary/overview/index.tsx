import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchAgencyResources from 'calypso/a8c-for-agencies/data/learn/use-fetch-agency-resources';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import ResourceCenterOverviewContent from '../../overview-content';

export default function ResourceCenterOverview() {
	const title = __( 'Resource center' );
	const { data, isLoading } = useFetchAgencyResources();

	if ( isLoading ) {
		return <PagePlaceholder title={ title } />;
	}

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
				<ResourceCenterOverviewContent data={ data } />
			</LayoutBody>
		</Layout>
	);
}
