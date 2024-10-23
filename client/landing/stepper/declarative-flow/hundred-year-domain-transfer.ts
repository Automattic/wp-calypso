import { HUNDRED_YEAR_DOMAIN_TRANSFER } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import domainTransfer from './domain-transfer';
import { Flow } from './internals/types';

const hundredYearDomainTransfer: Flow = {
	...domainTransfer,
	variantSlug: HUNDRED_YEAR_DOMAIN_TRANSFER,
	get title() {
		return translate( '100-Year Domain' );
	},

	// Always start on the "domains" step, as we don't need what comes before it for the 100-year domain transfer flow.
	// It doesn't make sense to show it as it contains additional cluttering information that doesn't matter
	// specifically under the 100-year domain context - they'll also come from a different entry point.
	useSteps() {
		const transferSteps = domainTransfer.useSteps();
		const domainsStepIndex = transferSteps.findIndex( ( step ) => step.slug === 'domains' );
		return transferSteps.slice( domainsStepIndex );
	},
};

export default hundredYearDomainTransfer;
