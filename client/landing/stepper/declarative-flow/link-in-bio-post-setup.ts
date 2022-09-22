import { LINK_IN_BIO_POST_SETUP_FLOW } from '@automattic/onboarding';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const linkInBioPostSetup: Flow = {
	name: LINK_IN_BIO_POST_SETUP_FLOW,
	title: 'Link in Bio',
	useSteps() {
		return [ 'linkInBioPostSetup' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'link-in-bio-post-setup', currentStep );

			switch ( currentStep ) {
				case 'linkInBioPostSetup':
					return window.location.assign(
						`/setup/launchpad?flow=link-in-bio&siteSlug=${ siteSlug }`
					);
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
