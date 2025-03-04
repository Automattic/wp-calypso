import { PLAYGROUND_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { STEPS } from './internals/steps';
import { Flow, ProvidedDependencies } from './internals/types';

const playground: Flow = {
	name: PLAYGROUND_FLOW,
	get title() {
		return translate( 'Playground' );
	},
	isSignupFlow: true,
	useSteps() {
		return [ STEPS.PLAYGROUND ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			// TODO: Implement go back
			navigate( 'onboarding' );
		};

		const goNext = () => {
			// TODO: Implement go next
			navigate( 'onboarding/domains' );
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		function submit( providedDependencies: ProvidedDependencies ) {
			// TODO: Implement submit
			navigate( 'onboarding/domains' );
		}

		return { goBack, goNext, goToStep, submit };
	},
};

export default playground;
