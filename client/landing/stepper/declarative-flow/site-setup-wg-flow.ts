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
};

export default siteSetupWithoutGoalsFlow;
