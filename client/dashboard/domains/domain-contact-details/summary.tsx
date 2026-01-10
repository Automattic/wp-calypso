import { type Domain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

interface ContactDetailsSummaryProps {
	domain: Domain;
	isDisabled?: boolean;
}

export default function ContactDetailsSummary( {
	domain,
	isDisabled,
}: ContactDetailsSummaryProps ) {
	const badges: SummaryButtonBadgeProps[] = [];

	// Display privacy protection status based on domain properties
	if ( domain.privacy_available ) {
		if ( domain.private_domain ) {
			badges.push( { text: __( 'Privacy protection on' ), intent: 'success' as const } );
		} else {
			badges.push( { text: __( 'Privacy protection off' ), intent: undefined } );
		}
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/contact-details` }
			title={ __( 'Contact details & privacy' ) }
			badges={ badges }
			density={ 'medium' as const }
			disabled={ isDisabled }
		/>
	);
}
