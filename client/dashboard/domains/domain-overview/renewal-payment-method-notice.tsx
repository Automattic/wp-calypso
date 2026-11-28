import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { changePaymentMethodRoute, purchaseSettingsRoute } from '../../app/router/me';
import Notice, {
	NoticeActionLinkButton,
	RouterNoticeActionLinkButton,
} from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import { isRegisteredDomain, isTldInMaintenance } from '../../utils/domain';
import {
	creditCardHasAlreadyExpired,
	getRenewalUrlFromPurchase,
	isCloseToExpiration,
	isExpiring,
} from '../../utils/purchase';
import type { Domain, Purchase } from '@automattic/api-core';

type RenewalProblem = 'expired-card' | 'no-payment-method' | 'auto-renew-off' | 'expiring-soon';

/**
 * Why the domain will lapse unless its owner acts: auto-renew is on but the
 * subscription cannot be charged (no payment method, or a card that has
 * already expired), or auto-renew is off. With auto-renew off, a domain close
 * to its expiry date that can be renewed now is `expiring-soon`.
 *
 * Whether auto-renew is on comes from the purchase: `domain.auto_renewing` is
 * also false for domains that aren't registrations, and once the next renewal
 * attempt is due.
 */
function getRenewalProblem( domain: Domain, purchase?: Purchase ): RenewalProblem | null {
	if ( ! purchase || ! domain.current_user_is_owner || domain.expired ) {
		return null;
	}

	if ( purchase.is_auto_renew_enabled ) {
		if ( creditCardHasAlreadyExpired( purchase ) ) {
			return 'expired-card';
		}

		return isExpiring( purchase ) ? 'no-payment-method' : null;
	}

	if ( ! isRegisteredDomain( domain ) ) {
		return null;
	}

	const canRenewNow = purchase.can_explicit_renew && ! isTldInMaintenance( domain );
	// The purchase can pass its expiry date before the domain is flagged as expired.
	const isPastExpiry = !! purchase.expiry_date && new Date( purchase.expiry_date ) < new Date();

	return canRenewNow && ( isCloseToExpiration( purchase ) || isPastExpiry )
		? 'expiring-soon'
		: 'auto-renew-off';
}

export default function RenewalPaymentMethodNotice( {
	domain,
	purchase,
}: {
	domain: Domain;
	purchase?: Purchase;
} ) {
	const locale = useLocale();
	const problem = getRenewalProblem( domain, purchase );

	if ( ! purchase || ! problem ) {
		return null;
	}

	const date = domain.expiry
		? formatDate( new Date( domain.expiry ), locale, { dateStyle: 'long' } )
		: '';

	const getTitle = () => {
		switch ( problem ) {
			case 'expired-card':
				return __( 'Your payment method has expired' );
			case 'no-payment-method':
				return __( 'Add a payment method' );
			case 'auto-renew-off':
				return __( 'Auto-renew is off' );
			case 'expiring-soon':
				return __( 'This domain expires soon' );
		}
	};

	const getMessage = () => {
		if ( problem === 'auto-renew-off' ) {
			return date
				? sprintf(
						// translators: %(date)s is the date the domain expires.
						__( 'This domain won’t renew automatically. It expires on %(date)s.' ),
						{ date }
					)
				: __( 'This domain won’t renew automatically.' );
		}

		if ( problem === 'expiring-soon' ) {
			return date
				? sprintf(
						// translators: %(date)s is the date the domain expires.
						__(
							'Auto-renew is off, so this domain won’t renew automatically. It expires on %(date)s.'
						),
						{ date }
					)
				: __( 'Auto-renew is off, so this domain won’t renew automatically.' );
		}

		if ( problem === 'expired-card' ) {
			const cardDetails = {
				// `creditCardHasAlreadyExpired` only matches stored cards, so one of these is always set.
				cardType: purchase.payment_card_display_brand || purchase.payment_card_type || '',
				cardNumber: purchase.payment_details ?? '',
				date,
			};

			return date
				? sprintf(
						// translators: %(cardType)s is a credit card brand, %(cardNumber)s the last 4 digits of its number, %(date)s the date the domain expires.
						__(
							'Your %(cardType)s ending in %(cardNumber)s has expired, so we can’t renew this domain automatically. It expires on %(date)s.'
						),
						cardDetails
					)
				: sprintf(
						// translators: %(cardType)s is a credit card brand, %(cardNumber)s the last 4 digits of its number.
						__(
							'Your %(cardType)s ending in %(cardNumber)s has expired, so we can’t renew this domain automatically.'
						),
						cardDetails
					);
		}

		return date
			? sprintf(
					// translators: %(date)s is the date the domain expires.
					__(
						'Auto-renew is on, but there is no payment method we can charge, so we can’t renew this domain automatically. It expires on %(date)s.'
					),
					{ date }
				)
			: __(
					'Auto-renew is on, but there is no payment method we can charge, so we can’t renew this domain automatically.'
				);
	};

	const getAction = () => {
		if ( problem === 'expiring-soon' ) {
			return (
				<NoticeActionLinkButton href={ getRenewalUrlFromPurchase( purchase ) } variant="solid">
					{ __( 'Renew domain' ) }
				</NoticeActionLinkButton>
			);
		}

		if ( problem === 'auto-renew-off' ) {
			return (
				<RouterNoticeActionLinkButton
					to={ purchaseSettingsRoute.fullPath }
					params={ { purchaseId: purchase.ID } }
					variant="solid"
				>
					{ __( 'Turn on auto-renew' ) }
				</RouterNoticeActionLinkButton>
			);
		}

		return (
			<RouterNoticeActionLinkButton
				to={ changePaymentMethodRoute.fullPath }
				params={ { purchaseId: purchase.ID } }
				variant="solid"
			>
				{ problem === 'expired-card' ? __( 'Update payment method' ) : __( 'Add payment method' ) }
			</RouterNoticeActionLinkButton>
		);
	};

	return (
		<Notice
			variant={ problem === 'expiring-soon' ? 'error' : 'warning' }
			title={ getTitle() }
			actions={ getAction() }
		>
			<Text as="p">{ getMessage() }</Text>
		</Notice>
	);
}
