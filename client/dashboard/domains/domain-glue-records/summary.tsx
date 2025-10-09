import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

interface Props {
	domainName: string;
}

export default function DomainGlueRecordsSettingsSummary( { domainName }: Props ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domainName }/glue-records` }
			title={ __( 'Glue records' ) }
			badges={ [] }
			density={ 'medium' as const }
		/>
	);
}
