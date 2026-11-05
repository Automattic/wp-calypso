import { DomainSubtype } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
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
 * A new registration is activating until its first SSL certificate is issued.
 * `set_primary_domain_pending` is not used here: the backend keeps reporting it
 * for days after a purchase, even once the domain works.
 */
export function useIsDomainActivating( domain: DomainSummary ) {
	const { data: sslDetails } = useDomainSslDetails( domain );

	return (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		isAwaitingFirstCertificate( sslDetails )
	);
}
