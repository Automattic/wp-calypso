import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const podcasts: Flow = {
	name: 'podcasts',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [ 'letsGetStarted', 'chooseADomain' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			navigate( 'chooseADomain' );
			return;
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
