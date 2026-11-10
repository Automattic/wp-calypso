import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { isTldInMaintenance } from '../../utils/domain';
import { useTrackOverviewItem } from './use-track-overview-item';

export default function DomainOverviewSslStatus( { domain }: { domain: Domain } ) {
	const trackItem = useTrackOverviewItem( domain );
	const hasEnTranslation = useHasEnTranslation();

	if (
		! domain.ssl_status ||
		domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER ||
		domain.transfer_status === DomainTransferStatus.PENDING_ASYNC
	) {
		return null;
	}

	if ( domain.ssl_status === 'active' ) {
		return <Badge intent="stable">{ __( 'SSL active' ) }</Badge>;
	}

	// Other subtypes have no certificate to fix, the security route rejects pending registrations,
	// and PointToWpcomNotice already covers domains that don't point here.
	if (
		! domain.points_to_wpcom ||
		( domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION &&
			domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION ) ||
		domain.pending_registration ||
		domain.pending_registration_at_registry
	) {
		return null;
	}

	const isPending = domain.ssl_status === 'newly_registered' || domain.ssl_status === 'pending';
	const pendingLabel = hasEnTranslation( 'SSL pending' )
		? __( 'SSL pending' )
		: __( 'SSL Pending' );
	const disabledLabel = hasEnTranslation( 'SSL disabled' )
		? __( 'SSL disabled' )
		: __( 'SSL Disabled' );

	return (
		<>
			<Badge intent={ isPending ? 'low' : 'high' }>
				{ isPending ? pendingLabel : disabledLabel }
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
