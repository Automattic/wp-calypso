import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { shouldRenderExpiringCreditCard, creditCardHasAlreadyExpired } from 'calypso/lib/purchases';
import { getChangePaymentMethodPath } from 'calypso/me/purchases/utils';

function ExpiringCreditCard( props ) {
	const { selectedSite, purchase, domain } = props;
	const translate = useTranslate();

	if ( ! selectedSite || ! purchase ) {
		return null;
	}

	if ( ! shouldRenderExpiringCreditCard( purchase ) ) {
		return null;
	}

	const changePaymentMethodPath = getChangePaymentMethodPath( selectedSite.slug, purchase );

	let messageText;

	if ( domain.type === domainTypes.MAPPED ) {
		if ( domain.bundledPlanSubscriptionId ) {
			return null;
		}

		if ( creditCardHasAlreadyExpired( purchase ) ) {
			messageText = translate(
				'Your credit card {{strong}}has expired before your domain mapping renewal date{{/strong}}. Please update your payment information on your account to avoid any disruptions to your service. Turn off auto-renew if you don’t want to see this message anymore.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			messageText = translate(
				'Your credit card is {{strong}}set to expire before your domain mapping renewal date{{/strong}}. Please update your payment information on your account to avoid any disruptions to your service. Turn off auto-renew if you don’t want to see this message anymore.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		}
	} else if ( domain.type === domainTypes.REGISTERED ) {
		if ( creditCardHasAlreadyExpired( purchase ) ) {
			messageText = translate(
				'Your credit card {{strong}}has expired before your domain renewal date{{/strong}}. Please update your payment information on your account to avoid any disruptions to your service. Turn off auto-renew if you don’t want to see this message anymore.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			messageText = translate(
				'Your credit card is {{strong}}set to expire before your domain renewal date{{/strong}}. Please update your payment information on your account to avoid any disruptions to your service. Turn off auto-renew if you don’t want to see this message anymore.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		}
	}

	return (
		<div>
			<p>{ messageText }</p>
			<Button primary={ true } href={ changePaymentMethodPath }>
				{ translate( 'Add a new payment method' ) }
			</Button>
		</div>
	);
}

export default ExpiringCreditCard;
