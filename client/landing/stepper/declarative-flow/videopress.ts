import { useFlowProgress, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { redirect } from './internals/steps-repository/import/util';
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
			'completingPurchase',
			'processing',
			'launchpad',
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-stepper' ) ) {
				document.body.classList.add( 'is-videopress-stepper' );
			}

			// Also target processing step for background images
			const processingStepClassName = 'is-processing-step';
			const hasProcessingStepClass = document.body.classList.contains( processingStepClassName );
			if ( 'processing' === _currentStep ) {
				if ( ! hasProcessingStepClass ) {
					document.body.classList.add( processingStepClassName );
				}
			} else if ( hasProcessingStepClass ) {
				document.body.classList.remove( processingStepClassName );
			}
		}

		const name = this.name;
		const { setDomain, setSiteDescription, setSiteTitle, setStepProgress } =
			useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );
		const _siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const _siteTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedSiteTitle() );

		const clearOnboardingSiteOptions = () => {
			setSiteTitle( '' );
			setSiteDescription( '' );
			setDomain( undefined );
		};

		const stepValidateUserIsLoggedIn = () => {
			if ( ! userIsLoggedIn ) {
				navigate( 'intro' );
				return false;
			}
			return true;
		};

		const stepValidateSiteTitle = () => {
			if ( ! stepValidateUserIsLoggedIn() ) {
				return false;
			}

			if ( ! _siteTitle.length ) {
				navigate( 'options' );
				return false;
			}

			return true;
		};

		switch ( _currentStep ) {
			case 'intro':
				clearOnboardingSiteOptions();
				break;
			case 'options':
				stepValidateUserIsLoggedIn();
				break;
			case 'chooseADomain':
			case 'chooseAPlan':
				stepValidateSiteTitle();
				break;
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
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

				case 'chooseADomain':
					return navigate( 'chooseAPlan' );

				case 'chooseAPlan': {
					return navigate( 'processing' );
				}

				case 'completingPurchase':
					return navigate( 'launchpad' );

				case 'launchpad': {
					clearOnboardingSiteOptions();
					return redirect( `/page/${ _siteSlug }/home` );
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
					return window.location.replace( `/view/${ _siteSlug }` );

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
