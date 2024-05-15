import { GUIDED_ONBOARDING } from '@automattic/onboarding';
import { STEPS } from './internals/steps';
import type { Flow } from './internals/types';

const guidedOnboarding: Flow = {
	name: GUIDED_ONBOARDING,
	isSignupFlow: true,
	startsWithAuth: true,
	useSteps() {
		return [ STEPS.DOMAINS ];
	},

	useStepNavigation() {
		const submit = () => {};

		const goBack = () => {
			return;
		};

		const goNext = async () => {};

		return { goNext, goBack, submit };
	},
};

export default guidedOnboarding;
