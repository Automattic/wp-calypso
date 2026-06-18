import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_AMPLIFY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';

const AmplifyOverview = () => {
	const title = __( 'Amplify' );

	return (
		<Layout className="amplify-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{ label: __( 'Amplify' ), href: A4A_AMPLIFY_LINK },
							{ label: __( 'Overview' ) },
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<VStack spacing={ 6 }>
					<Text>{ __( 'Placeholder content for Amplify > Overview.' ) }</Text>
				</VStack>
			</LayoutBody>
		</Layout>
	);
};

export default AmplifyOverview;
