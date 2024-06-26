import { Flow } from './internals/types';
import siteSetup from './site-setup-flow';

/**
 * A variant of site-setup flow without goals step.
 */
const siteSetupWithoutGoalsFlow: Flow = {
	...siteSetup,
	variantSlug: 'site-setup-wg',
	useSteps() {
		return siteSetup.useSteps().slice( 2 );
	},
	useStepNavigation( currentStep, navigate ) {
		const navigation = siteSetup.useStepNavigation( currentStep, navigate );
		const isFirstStep = this.useSteps()[ 0 ].slug === currentStep;
		// Delete `goBack` function on the first step fo the flow.
		if ( isFirstStep ) {
			delete navigation.goBack;
		}
		return navigation;
	},
};

export default siteSetupWithoutGoalsFlow;
