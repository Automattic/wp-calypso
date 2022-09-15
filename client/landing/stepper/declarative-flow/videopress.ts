import { useFlowProgress, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

import './internals/videopress.scss';

export const videopress: Flow = {
	name: VIDEOPRESS_FLOW,
	title: 'Video',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'options',
			'chooseADomain',
			'chooseAPlan',
			'processing',
			'launchpad',
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const name = this.name;
		const { setStepProgress, setSiteTitle, setSiteDescription } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'options' );
					}
					return window.location.replace(
						`/start/account/user?variationName=${ name }&pageTitle=Video%20Portfolio&redirect_to=/setup/options?flow=${ name }`
					);

				case 'options': {
					const { siteTitle, tagline } = providedDependencies;
					setSiteTitle( siteTitle as string );
					setSiteDescription( tagline as string );
					return navigate( 'chooseADomain' );
				}

				case 'chooseADomain': {
					return navigate( 'chooseAPlan' );
				}

				case 'chooseAPlan':
					return navigate( 'processing' );

				case 'processing': {
					return navigate( providedDependencies?.destination as StepPath );
				}

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

		const goBack = () => {
			switch ( _currentStep ) {
				case 'chooseADomain':
					return navigate( 'options' );
			}
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
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
