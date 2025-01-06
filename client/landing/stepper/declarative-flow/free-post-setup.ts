import { Onboard, OnboardActions } from '@automattic/data-stores';
import { FREE_POST_SETUP_FLOW } from '@automattic/onboarding';
import { dispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const freePostSetup: Flow = {
	name: FREE_POST_SETUP_FLOW,
	get title() {
		return translate( 'Free' );
	},
	isSignupFlow: false,
	bootFlow() {
		( dispatch( ONBOARD_STORE ) as OnboardActions ).setIntent( Onboard.SiteIntent.FreePostSetup );

		return [ STEPS.FREE_POST_SETUP ];
	},
	useStepNavigation( currentStep, navigate ) {
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
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

export default freePostSetup;
