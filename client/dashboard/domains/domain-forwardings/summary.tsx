import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '../../data/types';

export default function DomainForwardingsSettingsSummary( { domain }: { domain: Domain } ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/forwardings` }
			title={ __( 'Domain forwarding' ) }
			badges={ [] }
			density={ 'medium' as const }
		/>
	);
}
