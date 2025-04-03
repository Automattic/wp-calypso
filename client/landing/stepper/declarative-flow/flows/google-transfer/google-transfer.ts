import { GOOGLE_TRANSFER } from '@automattic/onboarding';
import { Flow } from '../../internals/types';
import domainTransfer from '../domain-transfer/domain-transfer';

const googleDomainTransfer: Flow = {
	...domainTransfer,
	variantSlug: GOOGLE_TRANSFER,
};

export default googleDomainTransfer;
