import { useTranslate } from 'i18n-calypso';
import StripeLogo from 'calypso/assets/images/jetpack/stripe-logo.svg';
import SupportCardsLogo from 'calypso/assets/images/jetpack/supported-credit-card-logos.svg';

import './style.scss';

export default function PaymentMethodStripeInfo() {
	const translate = useTranslate();
	return (
		<div className="payment-method-stripe-info">
			<img src={ StripeLogo } alt={ translate( 'Stripe logo' ) } />

			<p>
				{ translate(
					'Stripe, our payment provider, holds PCI Service Provider Level 1 certification—the highest security standard in the industry. Rest easy knowing your card data is in good hands.'
				) }
			</p>

			<img src={ SupportCardsLogo } alt={ translate( 'Supported credit card logos' ) } />
		</div>
	);
}
