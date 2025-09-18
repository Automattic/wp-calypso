import { DomainSubtype } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function DomainContactDetailsSettingsSummary( { domain }: { domain: Domain } ) {
	const badges: SummaryButtonBadgeProps[] = [];
	if ( domain.private_domain ) {
		badges.push( { text: __( 'Privacy protection on' ), intent: 'success' as const } );
	} else {
		badges.push( { text: __( 'Privacy protection off' ), intent: undefined } );
	}

	if ( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/contact-info` }
			title={ __( 'Contact details & privacy' ) }
			badges={ badges }
			density={ 'medium' as const }
		/>
	);
}
