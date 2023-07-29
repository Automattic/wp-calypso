import { GOOGLE_TRANSFER } from '@automattic/onboarding';
import domainTransfer from './domain-transfer';
import { Flow } from './internals/types';

const googleDomainTransfer: Flow = {
	...domainTransfer,
	variantSlug: GOOGLE_TRANSFER,
};

export default googleDomainTransfer;
