import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';

export default function DomainGlueRecordsSettingsSummary( { domain }: { domain: Domain } ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/glue-records` }
			title={ __( 'Glue records' ) }
			badges={ [] }
			density={ 'medium' as const }
		/>
	);
}
