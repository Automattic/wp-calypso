import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
// import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const newsletters: Flow = {
	name: 'newsletters',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [ 'intro', 'newsletterSetup' ] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		// const flowProgress = useSiteSetupFlowProgress( _currentStep, intent, storeType );

		// if ( flowProgress ) {
		// 	setStepProgress( flowProgress );
		// }

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
