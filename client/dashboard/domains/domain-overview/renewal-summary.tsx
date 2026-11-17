import { DomainSubtype } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { purchaseSettingsRoute } from '../../app/router/me';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { formatDate } from '../../utils/datetime';
import { needsPaymentMethodToAutoRenew } from '../../utils/domain';
import type { Domain, Purchase } from '@automattic/api-core';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export function getRenewalDate( domain: Domain ) {
	if (
		domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
		domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER ||
		! domain.subscription_id
	) {
		return null;
	}

	return (
		( domain.auto_renewing && ! domain.expired ? domain.auto_renewal_date : domain.expiry ) || null
	);
}

export function useRenewalNote( domain: Domain, purchase?: Purchase ) {
	const locale = useLocale();
	const renewalDate = getRenewalDate( domain );

	if ( ! renewalDate ) {
		return null;
	}

	const needsPaymentMethod = needsPaymentMethodToAutoRenew( domain, purchase );
	const date = formatDate(
		new Date( ( needsPaymentMethod && domain.expiry ) || renewalDate ),
		locale,
		{ dateStyle: 'long' }
	);

	if ( domain.expired ) {
		// translators: %(date)s: the date the domain expired.
		return sprintf( __( 'Expired on %(date)s' ), { date } );
	}

	return domain.auto_renewing && ! needsPaymentMethod
		? // translators: %(date)s: the date the domain renews.
			sprintf( __( 'Renews on %(date)s' ), { date } )
		: // translators: %(date)s: the date the domain expires.
			sprintf( __( 'Expires on %(date)s' ), { date } );
}

function getBadge( domain: Domain, purchase?: Purchase ): SummaryButtonBadgeProps {
	if ( domain.expired ) {
		return { text: __( 'Expired' ), intent: 'high' };
	}

	if ( needsPaymentMethodToAutoRenew( domain, purchase ) ) {
		return { text: __( 'Needs payment method' ), intent: 'medium' };
	}

	return domain.auto_renewing
		? { text: __( 'Auto-renew on' ), intent: 'stable' }
		: { text: __( 'Auto-renew off' ), intent: 'medium' };
}

export default function DomainRenewalSettingsSummary( {
	domain,
	purchase,
	purchaseId,
	onClick,
}: {
	domain: Domain;
	purchase?: Purchase;
	purchaseId: string;
	onClick?: () => void;
} ) {
	return (
		<RouterLinkSummaryButton
			to={ purchaseSettingsRoute.fullPath }
			params={ { purchaseId } }
			title={ __( 'Renewal & billing' ) }
			badges={ [ getBadge( domain, purchase ) ] }
			density="medium"
			onClick={ onClick }
		/>
	);
}
