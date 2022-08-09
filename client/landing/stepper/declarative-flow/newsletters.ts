import { useDispatch } from '@wordpress/data';
import { isEnabled } from '@automattic/calypso-config';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const newsletters: Flow = {
	name: 'newsletters',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'newsletterSetup',
			...( isEnabled( 'signup/launchpad' ) ? [ 'launchpad' ] : [] ),
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = () => {
			const totalSteps = 9;
			switch ( _currentStep ) {
				case 'intro':
					return { progress: 4, count: totalSteps };
				case 'newsletterSetup':
					return { progress: 5, count: totalSteps };
				default:
					return { progress: 0, count: 0 };
			}
		};

		setStepProgress( flowProgress() );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'intro':
					return navigate( 'newsletterSetup' );
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
