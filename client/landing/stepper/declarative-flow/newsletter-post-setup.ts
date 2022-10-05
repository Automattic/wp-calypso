import { NEWSLETTER_POST_SETUP_FLOW } from '@automattic/onboarding';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const newsletterPostSetup: Flow = {
	name: NEWSLETTER_POST_SETUP_FLOW,
	title: 'Newsletter',
	useSteps() {
		return [ 'newsletterPostSetup' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'newsletter-post-setup', flowName, currentStep );

			switch ( currentStep ) {
				case 'newsletterPostSetup':
					return window.location.assign(
						`/setup/launchpad?flow=newsletter&siteSlug=${ siteSlug }`
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
