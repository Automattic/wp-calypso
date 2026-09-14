import { DomainSubtype } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function NameServersSettingsSummary( {
	domain,
	isDisabled,
}: {
	domain: Domain;
	isDisabled?: boolean;
} ) {
	const badges: SummaryButtonBadgeProps[] = [];
	if ( domain.ssl_status === 'active' ) {
		badges.push( { text: __( 'SSL active' ), intent: 'stable' as const } );
	} else if ( domain.ssl_status === 'newly_registered' || domain.ssl_status === 'pending' ) {
		badges.push( { text: __( 'SSL Pending' ), intent: 'low' as const } );
	} else {
		badges.push( { text: __( 'SSL Disabled' ), intent: 'high' as const } );
	}

	if ( DomainSubtype.DOMAIN_REGISTRATION === domain.subtype.id ) {
		if ( domain.is_dnssec_enabled ) {
			badges.push( { text: __( 'DNSSEC enabled' ), intent: 'stable' as const } );
		} else {
			badges.push( { text: __( 'DNSSEC disabled' ), intent: 'draft' as const } );
		}
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/security` }
			title={ __( 'Domain security' ) }
			badges={ badges }
			density={ 'medium' as const }
			disabled={ isDisabled }
		/>
	);
}
