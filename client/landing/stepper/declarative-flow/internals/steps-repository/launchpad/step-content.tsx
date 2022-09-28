import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
};

const StepContent = ( { siteSlug, submit, goNext, goToStep }: StepContentProps ) => (
	<div className="launchpad__content">
		<Sidebar siteSlug={ siteSlug } submit={ submit } goNext={ goNext } goToStep={ goToStep } />
		<LaunchpadSitePreview siteSlug={ siteSlug } />
	</div>
);

export default StepContent;
