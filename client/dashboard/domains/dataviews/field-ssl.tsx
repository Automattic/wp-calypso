import { DomainSummary } from '@automattic/api-core';
import { sslDetailsQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';

export const DomainSslField = ( { domain }: { domain: DomainSummary } ) => {
	const { data: sslDetails } = useQuery( sslDetailsQuery( domain.domain ) );

	if ( sslDetails?.certificate_provisioned ) {
		return <Badge intent="success">{ __( 'SSL active' ) }</Badge>;
	}

	return <Badge intent="warning">{ __( 'SSL pending' ) }</Badge>;
};
