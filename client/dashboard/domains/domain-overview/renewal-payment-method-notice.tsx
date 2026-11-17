import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { changePaymentMethodRoute } from '../../app/router/me';
import Notice, { NoticeActionLink, RouterNoticeActionLinkButton } from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import { needsPaymentMethodToAutoRenew } from '../../utils/domain';
import { creditCardHasAlreadyExpired, getRenewalUrlFromPurchase } from '../../utils/purchase';
import type { Domain, Purchase } from '@automattic/api-core';

/**
 * Whether the domain is set to auto-renew but its subscription cannot be
 * charged, either because there is no payment method on it or because the card
 * it holds has already expired.
 */
function needsPaymentMethodToRenew( domain: Domain, purchase?: Purchase ): boolean {
	if ( ! purchase || ! domain.current_user_is_owner || ! domain.auto_renewing || domain.expired ) {
		return false;
	}

	return (
		needsPaymentMethodToAutoRenew( domain, purchase ) || creditCardHasAlreadyExpired( purchase )
	);
}

export default function RenewalPaymentMethodNotice( {
	domain,
	purchase,
	isDisabled,
}: {
	domain: Domain;
	purchase?: Purchase;
	isDisabled?: boolean;
} ) {
	const locale = useLocale();

	if ( ! purchase || ! needsPaymentMethodToRenew( domain, purchase ) ) {
		return null;
	}

	const date = domain.expiry
		? formatDate( new Date( domain.expiry ), locale, { dateStyle: 'long' } )
		: '';
	const hasExpiredCard = creditCardHasAlreadyExpired( purchase );

	const getMessage = () => {
		if ( hasExpiredCard ) {
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

	return (
		<Notice
			variant="warning"
			title={
				hasExpiredCard ? __( 'Your payment method has expired' ) : __( 'Add a payment method' )
			}
			actions={
				<>
					<RouterNoticeActionLinkButton
						to={ changePaymentMethodRoute.fullPath }
						params={ { purchaseId: purchase.ID } }
						variant="solid"
					>
						{ hasExpiredCard ? __( 'Update payment method' ) : __( 'Add payment method' ) }
					</RouterNoticeActionLinkButton>
					{ ! isDisabled && ( purchase.can_explicit_renew || purchase.is_renewable ) && (
						<NoticeActionLink href={ getRenewalUrlFromPurchase( purchase ) }>
							{ __( 'Renew now' ) }
						</NoticeActionLink>
					) }
				</>
			}
		>
			<Text as="p">{ getMessage() }</Text>
		</Notice>
	);
}
