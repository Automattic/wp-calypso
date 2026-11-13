import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { isTldInMaintenance } from '../../utils/domain';
import { useSslStatusLabels } from '../domain-security/use-ssl-status-labels';
import { isCompletedTransferNotPointingToWpcom } from './point-to-wpcom-notice';
import { useTrackOverviewItem } from './use-track-overview-item';

export default function DomainOverviewSslStatus( { domain }: { domain: Domain } ) {
	const trackItem = useTrackOverviewItem( domain );
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

	// Other subtypes have no certificate to fix, the security route rejects pending registrations,
	// and PointToWpcomNotice already covers completed transfers that don't point here.
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
		<>
			<Badge intent={ isPending ? 'low' : 'high' }>
				{ isPending ? sslStatusLabels.pending : sslStatusLabels.disabled }
			</Badge>
			{ ! isTldInMaintenance( domain ) && (
				<Link
					to={ `/domains/${ domain.domain }/security` }
					onClick={ () => trackItem( 'ssl-status' ) }
				>
					{ __( 'View SSL details' ) }
				</Link>
			) }
		</>
	);
}
