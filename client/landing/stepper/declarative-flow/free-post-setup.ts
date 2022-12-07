import { FREE_POST_SETUP_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import FreePostSetup from './internals/steps-repository/free-post-setup';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

export const freePostSetup: Flow = {
	name: FREE_POST_SETUP_FLOW,
	get title() {
		return translate( 'Free' );
	},
	useSteps() {
		return [ { slug: 'newsletterPostSetup', component: FreePostSetup } ];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'free-post-setup', flowName, currentStep );

			switch ( currentStep ) {
				case 'freePostSetup':
					return window.location.assign(
						`/setup/free/launchpad?siteSlug=${ siteSlug }&color=${ providedDependencies.color }`
					);
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
