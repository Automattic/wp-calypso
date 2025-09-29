import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';

export default function DomainRedirectSettingsSummary( { domain }: { domain: Domain } ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/redirect` }
			title={ __( 'Redirect' ) }
			badges={ [] }
			density={ 'medium' as const }
		/>
	);
}
