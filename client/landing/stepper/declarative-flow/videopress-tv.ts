import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, VIDEOPRESS_TV_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import './internals/videopress.scss';
import SiteOptions from './internals/steps-repository/site-options';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const videopressTv: Flow = {
	name: VIDEOPRESS_TV_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/intro' ),
			},
			{ slug: 'options', component: SiteOptions },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress tv stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-tv-stepper' ) ) {
				document.body.classList.add( 'is-videopress-tv-stepper' );
			}
		}

		const name = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		const locale = useLocale();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const { setSiteDescription, setSiteTitle } = useDispatch( ONBOARD_STORE );

		setStepProgress( flowProgress );

		const clearOnboardingSiteOptions = () => {
			setSiteTitle( '' );
			setSiteDescription( '' );
		};

		const stepValidateUserIsLoggedIn = () => {
			if ( ! userIsLoggedIn ) {
				navigate( 'intro' );
				return false;
			}
			return true;
		};

		// needs to be wrapped in a useEffect because validation can call `navigate` which needs to be called in a useEffect
		useEffect( () => {
			switch ( _currentStep ) {
				case 'intro':
					clearOnboardingSiteOptions();
					break;
				case 'options':
					stepValidateUserIsLoggedIn();
					break;
			}
		} );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'options' );
					}

					return window.location.replace(
						`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=VideoPress.TV&redirect_to=/setup/videopress-tv/options`
					);
			}
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
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

export default videopressTv;
