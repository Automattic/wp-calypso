import { __ } from '@wordpress/i18n';
import { domainConnectionSetupRoute } from '../../app/router/domains';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';

export default function DomainConnectionSetupSummary( { domain }: { domain: Domain } ) {
	if ( domain.points_to_wpcom ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ domainConnectionSetupRoute.fullPath }
			params={ { domainName: domain.domain } }
			title={ __( 'Domain connection setup' ) }
			density={ 'medium' as const }
		/>
	);
}
