import { DomainSubtype } from '@automattic/api-core';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function NameServersSettingsSummary( {
	domain,
	isDisabled,
	onClick,
}: {
	domain: Domain;
	isDisabled?: boolean;
	onClick?: () => void;
} ) {
	const hasEnTranslation = useHasEnTranslation();
	const badges: SummaryButtonBadgeProps[] = [];
	// An active certificate is shown in the domain overview header instead.
	if ( domain.ssl_status === 'newly_registered' || domain.ssl_status === 'pending' ) {
		badges.push( {
			text: hasEnTranslation( 'SSL pending' ) ? __( 'SSL pending' ) : __( 'SSL Pending' ),
			intent: 'low' as const,
		} );
	} else if ( domain.ssl_status !== 'active' ) {
		badges.push( {
			text: hasEnTranslation( 'SSL disabled' ) ? __( 'SSL disabled' ) : __( 'SSL Disabled' ),
			intent: 'high' as const,
		} );
	}

	const isRegistration = DomainSubtype.DOMAIN_REGISTRATION === domain.subtype.id;
	if ( isRegistration ) {
		badges.push(
			domain.is_dnssec_enabled
				? { text: __( 'Enabled' ), intent: 'stable' as const }
				: { text: __( 'Disabled' ), intent: 'draft' as const }
		);
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/security` }
			title={ isRegistration ? __( 'DNSSEC' ) : __( 'Domain security' ) }
			badges={ badges }
			density={ 'medium' as const }
			disabled={ isDisabled }
			onClick={ onClick }
		/>
	);
}
