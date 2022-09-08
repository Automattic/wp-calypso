import { useFlowProgress, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const videopress: Flow = {
	name: VIDEOPRESS_FLOW,
	title: 'VideoPress',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'options',
			'chooseADomain',
			// 'videopressSetup',
			// 'patterns',
			'completingPurchase',
			'processing',
			'launchpad',
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const name = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const [ _siteTitle, setSiteTitle ] = useState( '' );
		const [ _tagline, setTagline ] = useState( '' );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'options' );
					}
					return window.location.replace(
						`/start/account/user?variationName=${ name }&pageTitle=Link%20in%20Bio&redirect_to=/setup/options?flow=${ name }`
					);

				case 'options': {
					const { siteTitle, tagline } = providedDependencies;
					setSiteTitle( siteTitle as string );
					setTagline( tagline as string );
					return navigate( 'chooseADomain' );
				}

				case 'chooseADomain':
					return navigate( 'completingPurchase' );

				case 'completingPurchase':
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
