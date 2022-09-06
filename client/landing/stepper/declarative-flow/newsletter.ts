import { useFlowProgress, NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
		}, [] );

		return [ 'intro', 'newsletterSetup', 'subscribers', 'launchpad' ] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const name = this.name;
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const siteSlug = useSiteSlug();
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: this.name } );
		setStepProgress( flowProgress );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', _currentStep );

			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'newsletterSetup' );
					}
					return window.location.replace(
						`/start/account/user?variationName=${ name }&pageTitle=Newsletter&redirect_to=/setup/newsletterSetup?flow=${ name }`
					);

				case 'newsletterSetup':
					return window.location.replace(
						`/start/${ name }/domains?new=${ encodeURIComponent(
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
					return window.location.replace( `/view/${ siteSlug }` );

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
