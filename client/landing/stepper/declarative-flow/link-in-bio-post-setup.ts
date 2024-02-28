import { LINK_IN_BIO_POST_SETUP_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import LinkInBioPostSetup from './internals/steps-repository/link-in-bio-post-setup';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const linkInBioPostSetup: Flow = {
	name: LINK_IN_BIO_POST_SETUP_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	isSignupFlow: false,
	useSteps() {
		return [ { slug: 'linkInBioPostSetup', component: LinkInBioPostSetup } ];
	},

	useStepNavigation( currentStep ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'link-in-bio-post-setup', flowName, currentStep );

			switch ( currentStep ) {
				case 'linkInBioPostSetup':
					return window.location.assign( `/setup/link-in-bio/launchpad?siteSlug=${ siteSlug }` );
			}
		}

		return { submit };
	},
};

export default linkInBioPostSetup;
