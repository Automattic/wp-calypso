import { type Domain, DomainTransferStatus } from '@automattic/api-core';
import { InboundTransferFailed } from './failed';
import { InboundTransferInProgress } from './in-progress';

import './style.scss';

export default function InboundTransfer( { domain }: { domain: Domain } ) {
	if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY ) {
		return <InboundTransferInProgress domainName={ domain.domain } siteSlug={ domain.site_slug } />;
	}

	return (
		<InboundTransferFailed
			domainName={ domain.domain }
			lastTransferError={ domain.last_transfer_error }
		/>
	);
}
