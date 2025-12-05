import { type Domain, DomainTransferStatus } from '@automattic/api-core';
import { InboundTransferFailed } from './failed';
import { InboundTransferInProgress } from './in-progress';

import './style.scss';

export default function InboundTransfer( { domain }: { domain: Domain } ) {
	if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY ) {
		return <InboundTransferInProgress domain={ domain } />;
	}

	return <InboundTransferFailed domain={ domain } />;
}
