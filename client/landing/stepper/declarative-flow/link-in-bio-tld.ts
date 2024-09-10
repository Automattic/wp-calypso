import { LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import CreateSite from './internals/steps-repository/create-site';
import DesignCarousel from './internals/steps-repository/design-carousel';
import DomainsStep from './internals/steps-repository/domains';
import LaunchPad from './internals/steps-repository/launchpad';
import LinkInBioSetup from './internals/steps-repository/link-in-bio-setup';
import PlansStep from './internals/steps-repository/plans';
import Processing from './internals/steps-repository/processing-step';
import type { Flow, ProvidedDependencies } from './internals/types';

const linkInBio: Flow = {
	name: LINK_IN_BIO_TLD_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	isSignupFlow: true,
	useSteps() {
		//TODO: Use steps from steps.ts and in its async version.
		return stepsWithRequiredLogin( [
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'patterns', component: DesignCarousel },
			{ slug: 'linkInBioSetup', component: LinkInBioSetup },
			{ slug: 'plans', component: PlansStep },
			{ slug: 'createSite', component: CreateSite },
			{ slug: 'processing', component: Processing },
			{ slug: 'launchpad', component: LaunchPad },
		] );
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		triggerGuidesForStep( flowName, _currentStepSlug );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'domains':
					clearSignupDestinationCookie();

					return navigate( 'patterns' );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'createSite' );

				case 'createSite':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}
					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );
						const returnUrl = encodeURIComponent(
							`/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}

					return navigate( `launchpad?siteSlug=${ providedDependencies?.siteSlug }` );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = async () => {
			switch ( _currentStepSlug ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'link-in-bio-tld',
						siteId,
						siteSlug,
					} );
					return;

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default linkInBio;
