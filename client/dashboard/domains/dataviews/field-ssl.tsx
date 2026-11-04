import { DomainSubtype, DomainSummary } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useDomainSslDetails, useIsDomainActivating } from './use-domain-activation';

export const DomainSslField = ( { domain }: { domain: DomainSummary } ) => {
	const { data: sslDetails } = useDomainSslDetails( domain );
	const isActivating = useIsDomainActivating( domain );

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

	if ( isActivating ) {
		return null;
	}

	return <Badge intent="low">{ __( 'SSL pending' ) }</Badge>;
};
