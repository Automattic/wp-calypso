import { DomainSubtype } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { PRIVACY_PROTECTION } from '@automattic/urls';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import SummaryButton from '../../components/summary-button';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function DomainContactDetailsSettingsSummary( {
	domain,
	isDisabled,
	onClick,
}: {
	domain: Domain;
	isDisabled?: boolean;
	onClick?: () => void;
} ) {
	if ( domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ) {
		return null;
	}

	const badges: SummaryButtonBadgeProps[] = [
		domain.private_domain
			? { text: __( 'Privacy protection on' ), intent: 'stable' }
			: { text: __( 'Privacy protection off' ), intent: 'draft' },
	];

	// `current_user_can_manage` is always false in a support session. The link is still shown so
	// that support can copy its URL for the user; the route itself blocks editing in that case.
	const canEditContactDetails =
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		( domain.current_user_can_manage || isSupportSession() ) &&
		! domain.pending_transfer &&
		! domain.expired;
	const canOpen =
		canEditContactDetails || ( domain.current_user_can_manage && domain.privacy_available );

	if ( ! canOpen && ! domain.privacy_available ) {
		return (
			<SummaryButton
				href={ PRIVACY_PROTECTION }
				target="_blank"
				rel="noreferrer"
				title={ __( 'Contact details & privacy' ) }
				description={ __( 'Privacy protection is not available due to the registry’s policies.' ) }
				badges={ badges }
				density="medium-low"
				onClick={ onClick }
			/>
		);
	}

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/contact-info` }
			title={ __( 'Contact details & privacy' ) }
			badges={ badges }
			density="medium"
			disabled={ isDisabled || ! canOpen }
			onClick={ onClick }
		/>
	);
}
