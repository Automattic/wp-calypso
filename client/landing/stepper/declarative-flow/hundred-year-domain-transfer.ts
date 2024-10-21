import { HUNDRED_YEAR_DOMAIN_TRANSFER } from '@automattic/onboarding';
import domainTransfer from './domain-transfer';
import { Flow } from './internals/types';

const hundredYearDomainTransfer: Flow = {
	...domainTransfer,
	variantSlug: HUNDRED_YEAR_DOMAIN_TRANSFER,

	useSideEffect( _currentStep, navigate ) {
		// Always skip the "intro" step as we don't need it for the 100-year domain transfer flow.
		// It doesn't make sense to show it as it contains additional cluttering information that
		// doesn't matter specifically for the 100-year domain context - they'll come from a different entry point also.
		if ( _currentStep === 'intro' ) {
			navigate( 'domains' );
		}
	},
};

export default hundredYearDomainTransfer;
