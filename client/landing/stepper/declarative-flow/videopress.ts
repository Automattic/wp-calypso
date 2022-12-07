import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import './internals/videopress.scss';
import ChooseADomain from './internals/steps-repository/choose-a-domain';
import ChooseAPlan from './internals/steps-repository/choose-a-plan';
import Intro from './internals/steps-repository/intro';
import Launchpad from './internals/steps-repository/launchpad';
import ProcessingStep from './internals/steps-repository/processing-step';
import SiteOptions from './internals/steps-repository/site-options';
import VideomakerSetup from './internals/steps-repository/videomaker-setup';
import type { Flow, ProvidedDependencies } from './internals/types';

export const videopress: Flow = {
	name: VIDEOPRESS_FLOW,
	get title() {
		return translate( 'Video' );
	},
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			{ slug: 'intro', component: Intro },
			{ slug: 'options', component: SiteOptions },
			{ slug: 'videomakerSetup', component: VideomakerSetup },
			{ slug: 'chooseADomain', component: ChooseADomain },
			{ slug: 'chooseAPlan', component: ChooseAPlan },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'launchpad', component: Launchpad },
		];
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
		const { setDomain, setSelectedDesign, setSiteDescription, setSiteTitle, setStepProgress } =
			useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );
		const _siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const _siteTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedSiteTitle() );
		const locale = useLocale();

		const clearOnboardingSiteOptions = () => {
			setSiteTitle( '' );
			setSiteDescription( '' );
			setDomain( undefined );
			setSelectedDesign( undefined );
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
						`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=Video%20Portfolio&redirect_to=/setup/videopress/options`
					);

				case 'options': {
					const { siteTitle, tagline } = providedDependencies;
					setSiteTitle( siteTitle as string );
					setSiteDescription( tagline as string );
					return navigate( 'videomakerSetup' );
				}

				case 'videomakerSetup': {
					return navigate( 'chooseADomain' );
				}

				case 'chooseADomain': {
					return navigate( 'chooseAPlan' );
				}

				case 'chooseAPlan': {
					return navigate( 'processing' );
				}

				case 'launchpad': {
					clearOnboardingSiteOptions();
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
					return window.location.replace( `/view/${ _siteSlug }` );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
