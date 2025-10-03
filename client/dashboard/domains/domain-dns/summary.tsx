import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';

export default function DnsSettingsSummary( { domain }: { domain: Domain } ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/dns` }
			title={ __( 'DNS records' ) }
			badges={ [] }
			density={ 'medium' as const }
		/>
	);
}
