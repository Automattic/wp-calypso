import { GOOGLE_TRANSFER } from '@automattic/onboarding';
import { DeprecatedFlowV1 } from '../../internals/types';
import domainTransfer from '../domain-transfer/domain-transfer';

const googleDomainTransfer: DeprecatedFlowV1 = {
	...domainTransfer,
	variantSlug: GOOGLE_TRANSFER,
};

export default googleDomainTransfer;
