import { __ } from '@wordpress/i18n';
import { purchaseSettingsRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

function getBadge( domain: Domain ): SummaryButtonBadgeProps {
	if ( domain.expired ) {
		return { text: __( 'Expired' ), intent: 'high' };
	}

	return domain.auto_renewing
		? { text: __( 'Auto-renew on' ), intent: 'stable' }
		: { text: __( 'Auto-renew off' ), intent: 'medium' };
}

export default function DomainRenewalSettingsSummary( {
	domain,
	purchaseId,
}: {
	domain: Domain;
	purchaseId: string;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ purchaseSettingsRoute.fullPath }
			params={ { purchaseId } }
			title={ __( 'Renewal & billing' ) }
			badges={ [ getBadge( domain ) ] }
			density="medium"
		/>
	);
}
