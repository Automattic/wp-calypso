import { AmexLogo, CBLogo, JcbLogo, MastercardLogo, VisaLogo } from './payment-logos';
import { PaymentMethodLogos } from './payment-method-logos';

export default function CreditCardLogos( { currency }: { currency: string | null } ) {
	return (
		<PaymentMethodLogos className="credit-card__logos">
			{ currency === 'EUR' && <CBLogo className="has-background" /> }
			{ currency === 'JPY' && <JcbLogo /> }
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
		</PaymentMethodLogos>
	);
}
