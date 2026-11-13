import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { Badge } from '@wordpress/ui';
import { useSslStatusLabels } from '../domain-security/use-ssl-status-labels';
import { isCompletedTransferNotPointingToWpcom } from './point-to-wpcom-notice';

export default function DomainOverviewSslStatus( { domain }: { domain: Domain } ) {
	const sslStatusLabels = useSslStatusLabels();

	if (
		! domain.ssl_status ||
		domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER ||
		domain.transfer_status === DomainTransferStatus.PENDING_ASYNC
	) {
		return null;
	}

	if ( domain.ssl_status === 'active' ) {
		return <Badge intent="stable">{ sslStatusLabels.active }</Badge>;
	}

	// Other subtypes and pending registrations have no certificate to fix, and PointToWpcomNotice
	// already covers completed transfers that don't point here.
	if (
		isCompletedTransferNotPointingToWpcom( domain ) ||
		( domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION &&
			domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION ) ||
		domain.pending_registration ||
		domain.pending_registration_at_registry
	) {
		return null;
	}

	const isPending = domain.ssl_status === 'newly_registered' || domain.ssl_status === 'pending';

	return (
		<Badge intent={ isPending ? 'low' : 'high' }>
			{ isPending ? sslStatusLabels.pending : sslStatusLabels.disabled }
		</Badge>
	);
}
