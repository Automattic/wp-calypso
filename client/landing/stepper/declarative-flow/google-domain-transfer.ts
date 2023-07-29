import { GOOGLE_DOMAIN_TRANSFER } from '@automattic/onboarding';
import domainTransfer from './domain-transfer';

const googleDomainTransfer = {
	...domainTransfer,
	name: GOOGLE_DOMAIN_TRANSFER,
};

export default googleDomainTransfer;
