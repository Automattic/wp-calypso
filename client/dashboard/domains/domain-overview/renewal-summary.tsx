import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { purchaseSettingsRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { formatDate } from '../../utils/datetime';
import type { Domain } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

function getBadges( domain: Domain, date: string ): SummaryButtonBadgeProps[] {
	if ( domain.expired ) {
		// translators: %(date)s: the date the domain expired.
		return [ { text: sprintf( __( 'Expired on %(date)s' ), { date } ), intent: 'high' } ];
	}

	if ( domain.auto_renewing ) {
		// translators: %(date)s: the date the domain renews.
		return [ { text: sprintf( __( 'Renews on %(date)s' ), { date } ), intent: 'stable' } ];
	}

	return [
		{ text: __( 'Auto-renew off' ), intent: 'medium' },
		// translators: %(date)s: the date the domain expires.
		{ text: sprintf( __( 'Expires on %(date)s' ), { date } ), intent: 'medium' },
	];
}

export default function DomainRenewalSettingsSummary( {
	domain,
	purchaseId,
	date,
	onClick,
}: {
	domain: Domain;
	purchaseId: string;
	date: string;
	onClick?: () => void;
} ) {
	const locale = useLocale();
	const formattedDate = formatDate( new Date( date ), locale, { dateStyle: 'long' } );

	return (
		<RouterLinkSummaryButton
			to={ purchaseSettingsRoute.fullPath }
			params={ { purchaseId } }
			title={ __( 'Renewal & billing' ) }
			badges={ getBadges( domain, formattedDate ) }
			density="medium"
			onClick={ onClick }
		/>
	);
}
