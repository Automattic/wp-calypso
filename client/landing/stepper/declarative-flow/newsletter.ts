import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const newsletter: Flow = {
	name: NEWSLETTER_FLOW,
	title: 'Newsletter',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_newsletter', { flow: this.name } );
		}, [] );

		return [ 'intro', 'newsletterSetup', 'subscribers', 'launchpad' ] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const siteSlug = useSiteSlug();
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( {
			stepName: _currentStep,
			flowName,
		} );
		setStepProgress( flowProgress );
		const locale = useLocale();

		const getStartUrl = () => {
			return locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Newsletter&redirect_to=/setup/newsletterSetup?flow=${ flowName }`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Newsletter&redirect_to=/setup/newsletterSetup?flow=${ flowName }`;
		};

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post( `guides/trigger?flow=${ name }&step=${ _currentStep }`, {
			apiNamespace: 'wpcom/v2/',
		} );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );
			const logInUrl = getStartUrl();

			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'newsletterSetup' );
					}
					return window.location.assign( logInUrl );

				case 'newsletterSetup':
					return window.location.assign(
						`/start/${ flowName }/domains?new=${ encodeURIComponent(
							providedDependencies.siteTitle as string
						) }&search=yes&hide_initial_query=yes` +
							( typeof providedDependencies.siteAccentColor === 'string' &&
							providedDependencies.siteAccentColor !== ''
								? `&siteAccentColor=${ encodeURIComponent( providedDependencies.siteAccentColor ) }`
								: '' )
					);

				case 'subscribers':
					return navigate( 'launchpad' );
			}
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
