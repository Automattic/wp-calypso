import { type Domain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

interface ContactDetailsSummaryProps {
	domain: Domain;
	isDisabled?: boolean;
}

export default function ContactDetailsSummary( {
	domain,
	isDisabled,
}: ContactDetailsSummaryProps ) {
	// TODO: Implement privacy status detection in task 2
	const privacyStatus = __( 'Privacy protection status' );

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/contact-details` }
			title={ __( 'Contact details & privacy' ) }
			badges={ [ privacyStatus ] }
			density={ 'medium' as const }
			disabled={ isDisabled }
		/>
	);
}
