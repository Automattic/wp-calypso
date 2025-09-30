import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';

export default function SiteRedirectSettingsSummary( { domain }: { domain: Domain } ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ encodeURIComponent( domain.domain ) }/site-redirect` }
			title={ __( 'Site redirect' ) }
			badges={ [] }
			density={ 'medium' as const }
		/>
	);
}
