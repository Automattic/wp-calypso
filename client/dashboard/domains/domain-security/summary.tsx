import { DomainSubtype } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function DomainSecuritySettingsSummary( {
	domain,
	isDisabled,
	onClick,
}: {
	domain: Domain;
	isDisabled?: boolean;
	onClick?: () => void;
} ) {
	// SSL problems are shown in the domain overview header instead.
	const badges: SummaryButtonBadgeProps[] = [];
	if ( DomainSubtype.DOMAIN_REGISTRATION === domain.subtype.id ) {
		badges.push(
			domain.is_dnssec_enabled
				? { text: __( 'DNSSEC enabled' ), intent: 'stable' as const }
				: { text: __( 'DNSSEC disabled' ), intent: 'none' as const }
		);
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/security` }
			title={ __( 'Domain security' ) }
			badges={ badges }
			density={ 'medium' as const }
			disabled={ isDisabled }
			onClick={ onClick }
		/>
	);
}
