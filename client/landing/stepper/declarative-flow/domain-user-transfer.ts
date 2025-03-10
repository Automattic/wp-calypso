import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	Flow,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';

const DOMAIN_USER_TRANSFER_STEPS = stepsWithRequiredLogin( [ STEPS.DOMAIN_CONTACT_INFO ] );

const domainUserTransfer: Flow = {
	name: 'domain-user-transfer',
	isSignupFlow: false,
	useSteps() {
		return DOMAIN_USER_TRANSFER_STEPS;
	},
	__experimentalUseBuiltinAuth: true,
	useStepNavigation( currentStep, navigate ) {
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'domain-contact-info':
					return window.location.assign(
						`/checkout/domain-transfer-to-any-user/thank-you/${ providedDependencies.domain }`
					);
			}
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default domainUserTransfer;
