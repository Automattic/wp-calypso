import { useLocale } from '@automattic/i18n-utils';
import { VIDEOPRESS_TV_PURCHASE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import './internals/videopress.scss';
import ProcessingStep from './internals/steps-repository/processing-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const videopressTvPurchase: Flow = {
	name: VIDEOPRESS_TV_PURCHASE_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	useSteps() {
		return [ { slug: 'processing', component: ProcessingStep } ];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress tv stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-tv-stepper' ) ) {
				document.body.classList.add( 'is-videopress-tv-stepper' );
			}
		}

		const name = this.name;
		const locale = useLocale();
		const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
		const { supportedPlans } = useSupportedPlans( locale, 'MONTHLY' );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const addVideoPressPendingAction = () => {
			// if the supported plans haven't been received yet, wait for next rerender to try again.
			if ( 0 === supportedPlans.length ) {
				return;
			}

			setPendingAction( async () => {
				setProgress( 0 );
				setProgress( 0.5 );
				setProgress( 0.75 );
			} );
		};

		// needs to be wrapped in a useEffect because validation can call `navigate` which needs to be called in a useEffect
		useEffect( () => {
			switch ( _currentStep ) {
				case 'processing':
					if ( ! userIsLoggedIn ) {
						window.location.replace(
							`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=VideoPress.TV&redirect_to=/setup/videopress-tv-purchase/processing`
						);
						return;
					}
					addVideoPressPendingAction();
					break;
				default:
					break;
			}
		} );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				default:
					return navigate( 'processing' );
			}
		};

		const goToStep = ( step: string ) => {
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default videopressTvPurchase;
