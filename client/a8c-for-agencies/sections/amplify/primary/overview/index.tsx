import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
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

const AmplifyOverview = () => {
	const title = __( 'Amplify' );

	return (
		<Layout className="amplify-overview" title={ title } wide>
			<LayoutTop>
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
		</Layout>
	);
};

export default AmplifyOverview;
