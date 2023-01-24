import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, FREE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import DesignSetup from './internals/steps-repository/design-setup';
import FreeSetup from './internals/steps-repository/free-setup';
import Intro from './internals/steps-repository/intro';
import LaunchPad from './internals/steps-repository/launchpad';
import Processing from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import type { Flow, ProvidedDependencies } from './internals/types';

const free: Flow = {
	name: FREE_FLOW,
	get title() {
		return translate( 'Free' );
	},
	useSteps() {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			resetOnboardStore();
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_free', { flow: this.name } );
		}, [] );

		return [
			{ slug: 'intro', component: Intro },
			{ slug: 'freeSetup', component: FreeSetup },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: Processing },
			{ slug: 'launchpad', component: LaunchPad },
			{ slug: 'designSetup', component: DesignSetup },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();
		const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStep,
			}
		);

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			const logInUrl =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/${ flowName }/patterns`
					: `/start/account/user?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/${ flowName }/patterns`;

			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'intro':
					clearSignupDestinationCookie();
					if ( userIsLoggedIn ) {
						return navigate( 'freeSetup' );
					}
					return window.location.assign( logInUrl );

				case 'freeSetup':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace( `/home/${ providedDependencies?.siteSlug }` );
					}

					if ( selectedDesign ) {
						return navigate( `launchpad?siteSlug=${ siteSlug }` );
					}

					return navigate( `designSetup?siteSlug=${ providedDependencies?.siteSlug }` );

				case 'designSetup':
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
					return navigate( `processing?siteSlug=${ siteSlug }` );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

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

export default free;
