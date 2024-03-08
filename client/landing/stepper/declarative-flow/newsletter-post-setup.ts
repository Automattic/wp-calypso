import { NEWSLETTER_POST_SETUP_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import NewsletterPostSetup from './internals/steps-repository/newsletter-post-setup';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const newsletterPostSetup: Flow = {
	name: NEWSLETTER_POST_SETUP_FLOW,
	get title() {
		return translate( 'Newsletter' );
	},
	isSignupFlow: false,
	useSteps() {
		return [ { slug: 'newsletterPostSetup', component: NewsletterPostSetup } ];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'newsletter-post-setup', flowName, currentStep );

			switch ( currentStep ) {
				case 'newsletterPostSetup':
					return window.location.assign(
						`/setup/newsletter/launchpad?siteSlug=${ siteSlug }&color=${ providedDependencies.color }`
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

export default newsletterPostSetup;
