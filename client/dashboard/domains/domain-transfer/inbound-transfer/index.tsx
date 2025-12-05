import { type Domain, DomainTransferStatus } from '@automattic/api-core';
import { purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { InboundTransferFailed } from './failed';
import { InboundTransferInProgress } from './in-progress';

import './style.scss';

export default function InboundTransfer( { domain }: { domain: Domain } ) {
	const { data: purchase } = useQuery(
		purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
	);

	if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY ) {
		return <InboundTransferInProgress domain={ domain } purchase={ purchase } />;
	}

	return <InboundTransferFailed domain={ domain } purchase={ purchase } />;
}
