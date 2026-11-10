import { DomainSubtype } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { DomainSummary, SslDetails } from '@automattic/api-core';

const SSL_POLL_INTERVAL_MS = 10_000;

/**
 * The SSL endpoint stops reporting `is_newly_registered` once the domain
 * resolves, which can happen before the certificate is issued. While the
 * domain is still being made the primary address, it is activating too.
 * `set_primary_domain_pending` alone is not enough: the backend keeps
 * reporting it for days after a purchase, even once the domain works.
 */
function isAwaitingFirstCertificate( domain: DomainSummary, sslDetails?: SslDetails ) {
	return (
		!! sslDetails &&
		! sslDetails.certificate_provisioned &&
		( sslDetails.is_newly_registered || domain.set_primary_domain_pending )
	);
}

export function useDomainSslDetails( domain: DomainSummary ) {
	return useQuery( {
		...sslDetailsQuery( domain.domain ),
		staleTime: 60_000,
		enabled:
			domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER &&
			domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS,
		refetchInterval: ( query ) =>
			domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
			isAwaitingFirstCertificate( domain, query.state.data )
				? SSL_POLL_INTERVAL_MS
				: false,
	} );
}

/**
 * A new registration is activating until its first SSL certificate is issued.
 */
export function useIsDomainActivating( domain: DomainSummary ) {
	const { data: sslDetails } = useDomainSslDetails( domain );

	return (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		isAwaitingFirstCertificate( domain, sslDetails )
	);
}
