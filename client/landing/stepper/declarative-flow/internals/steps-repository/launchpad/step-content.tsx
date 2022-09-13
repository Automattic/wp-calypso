import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	navigation: NavigationControls;
};

const StepContent = ( { siteSlug, navigation }: StepContentProps ) => (
	<div className="launchpad__content">
		<Sidebar siteSlug={ siteSlug } navigation={ navigation } />
		<LaunchpadSitePreview siteSlug={ siteSlug } />
	</div>
);

export default StepContent;
