import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

interface DomainGlueRecordsSettingsSummaryProps {
	domainName: string;
	isDisabled?: boolean;
}

export default function DomainGlueRecordsSettingsSummary( {
	domainName,
	isDisabled,
}: DomainGlueRecordsSettingsSummaryProps ) {
	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domainName }/glue-records` }
			title={ __( 'Glue records' ) }
			badges={ [] }
			density={ 'medium' as const }
			disabled={ isDisabled }
		/>
	);
}
