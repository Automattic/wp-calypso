import { type Domain, DomainTransferStatus } from '@automattic/api-core';
import { InboundTransferComplete } from './complete';
import { InboundTransferFailed } from './failed';
import { InboundTransferInProgress } from './in-progress';

import './style.scss';

export default function InboundTransfer( { domain }: { domain: Domain } ) {
	const getInboundTransferStep = () => {
		if ( domain.transfer_status === DomainTransferStatus.PENDING_REGISTRY ) {
			return (
				<InboundTransferInProgress domainName={ domain.domain } siteSlug={ domain.site_slug } />
			);
		}

		if ( domain.transfer_status === DomainTransferStatus.COMPLETED ) {
			return <InboundTransferComplete domainName={ domain.domain } siteSlug={ domain.site_slug } />;
		}

		return <InboundTransferFailed domainName={ domain.domain } />;
	};

	return getInboundTransferStep();
}
