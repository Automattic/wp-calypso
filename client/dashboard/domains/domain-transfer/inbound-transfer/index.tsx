import { type Domain, DomainTransferStatus } from '@automattic/api-core';
import { InboundTransferComplete } from './complete';
import { InboundTransferInProgress } from './in-progress';

export default function InboundTransfer( { domain }: { domain: Domain } ) {
	const getInboundTransferStep = () => {
		if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY ) {
			return (
				<InboundTransferInProgress domainName={ domain.domain } siteSlug={ domain.site_slug } />
			);
		}

		return <InboundTransferComplete domainName={ domain.domain } siteSlug={ domain.site_slug } />;
	};

	return getInboundTransferStep();
}
