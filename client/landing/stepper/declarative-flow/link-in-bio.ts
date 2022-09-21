import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const linkInBio: Flow = {
	name: LINK_IN_BIO_FLOW,
	title: 'Link in Bio',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_link_in_bio', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'linkInBioSetup',
			'domains',
			'patterns',
			'processing',
			'launchpad',
			'plans',
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();

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

		const getStartUrl = () => {
			return locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/patterns?flow=${ flowName }`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/patterns?flow=${ flowName }`;
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );
			const logInUrl = getStartUrl();

			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return navigate( 'domains' );
				// return window.location.assign(
				// 	`/start/${ flowName }/domains?new=${ encodeURIComponent(
				// 		providedDependencies.siteTitle as string
				// 	) }&search=yes&hide_initial_query=yes`
				// );

				case 'domains':
					//Still in development
					//return navigate( 'plans' );
					break;

				case 'plansLinkInBio':
					return navigate( 'launchpad' );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

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

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
