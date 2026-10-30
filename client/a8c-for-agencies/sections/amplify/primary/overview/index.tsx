import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import NewDashboardNote from 'calypso/a8c-for-agencies/components/new-dashboard-note';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import OptInPreviewPanel from 'calypso/dashboard/agency/opt-in-preview';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AmplifyAddSite from '../../add-site';
import AmplifyAiSection from './sections/ai-section';
import AmplifyAiWorkflow from './sections/ai-workflow';
import AmplifyFAQ from './sections/faq';
import AmplifyHero from './sections/hero';
import AmplifyHowItWorks from './sections/how-it-works';
import AmplifyHumanSection from './sections/human-section';

import './style.scss';

const AmplifyOverview = () => {
	const title = __( 'Amplify by Automattic for Agencies' );

	return (
		<Layout className="amplify-overview" title={ title } wide>
			<LayoutTop>
				<NewDashboardNote />
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<AmplifyAddSite />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<AmplifyHero />
				<AmplifyHowItWorks />
				<AmplifyHumanSection />
				<AmplifyAiSection />
				<AmplifyAiWorkflow />
				<AmplifyFAQ />
			</LayoutBody>
			<OptInPreviewPanel />
		</Layout>
	);
};

export default AmplifyOverview;
