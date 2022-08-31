import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
};

const StepContent = ( { siteSlug, submit, goNext }: StepContentProps ) => (
	<div className="launchpad__content">
		<Sidebar siteSlug={ siteSlug } submit={ submit } goNext={ goNext } />
		<LaunchpadSitePreview siteSlug={ siteSlug } />
	</div>
);

export default StepContent;
