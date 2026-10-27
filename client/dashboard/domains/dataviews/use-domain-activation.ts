import { DomainSubtype } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { isPendingPrimaryDomain } from '../../utils/domain';
import type { DomainSummary, SslDetails } from '@automattic/api-core';

const SSL_POLL_INTERVAL_MS = 10_000;

function isAwaitingFirstCertificate( sslDetails?: SslDetails ) {
	return !! sslDetails && sslDetails.is_newly_registered && ! sslDetails.certificate_provisioned;
}

export function useDomainSslDetails( domain: DomainSummary ) {
	return useQuery( {
		...sslDetailsQuery( domain.domain ),
		staleTime: 60_000,
		enabled:
			domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER &&
			domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS,
		refetchInterval: ( query ) =>
			isAwaitingFirstCertificate( query.state.data ) ? SSL_POLL_INTERVAL_MS : false,
	} );
}

/**
 * A domain is activating from the moment it is purchased until it works: the
 * backend is still making it the primary address, or a new registration is
 * still waiting for its first SSL certificate.
 */
export function useIsDomainActivating( domain: DomainSummary ) {
	const { data: sslDetails } = useDomainSslDetails( domain );

	if ( isPendingPrimaryDomain( domain ) ) {
		return true;
	}

	return (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		isAwaitingFirstCertificate( sslDetails )
	);
}
