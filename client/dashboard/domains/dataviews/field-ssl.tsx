import { DomainSubtype, DomainSummary } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';

export const DomainSslField = ( { domain }: { domain: DomainSummary } ) => {
	const { data: sslDetails } = useQuery( {
		...sslDetailsQuery( domain.domain ),
		staleTime: 60_000,
		enabled:
			domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER &&
			domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS,
	} );

	if ( domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER ) {
		// TODO: only show this if there is no active domain connection for the domain transfer
		return '-';
	}

	if (
		domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ||
		sslDetails?.certificate_provisioned
	) {
		return <Badge intent="stable">{ __( 'SSL active' ) }</Badge>;
	}

	return <Badge intent="low">{ __( 'SSL pending' ) }</Badge>;
};
