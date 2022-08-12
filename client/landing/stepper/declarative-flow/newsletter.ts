import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const newsletter: Flow = {
	name: 'newsletter',
	title: 'Newsletters',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'newsletterSetup',
			'completingPurchase',
			'processing',
			'subscribers',
			'processingFake',
			...( isEnabled( 'signup/launchpad' ) ? [ 'launchpad' ] : [] ),
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );

		function submit() {
			switch ( _currentStep ) {
				case 'completingPurchase':
					return navigate( 'processing' );
				case 'processing':
					return navigate( 'newsletterAddSubscribers' );
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'newsletterSetup' );
					}
					return window.location.replace(
						'/start/account?redirect_to=/setup/newsletterSetup?flow=newsletter'
					);

				case 'newsletterSetup':
					return window.location.replace( '/start/newsletter/domains' );

				case 'subscribers':
					return navigate( 'processingFake' );

				case 'processingFake':
					return navigate( 'launchpad' );

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
