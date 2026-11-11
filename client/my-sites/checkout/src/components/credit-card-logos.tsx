import styled from '@emotion/styled';
import { AmexLogo, CBLogo, JcbLogo, MastercardLogo, VisaLogo } from './payment-logos';
import { PaymentMethodLogos } from './payment-method-logos';

const CompactCreditCardLogos = styled( PaymentMethodLogos )`
	flex: 0 0 auto;
	flex-wrap: nowrap;
	gap: 4px;

	&.credit-card__logos svg {
		position: static;
		background: var( --studio-white );
		border: 1px solid var( --wp-components-color-gray-200, var( --color-border-subtle ) );
		border-radius: 4px;
		padding: 4px 6px;
		box-sizing: border-box;
		height: 22px;
		width: 32px;
	}

	.credit-card__logos-overflow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 22px;
		padding: 0 6px;
		background: var( --studio-white );
		border: 1px solid var( --wp-components-color-gray-200, var( --color-border-subtle ) );
		border-radius: 4px;
		box-sizing: border-box;
		font-size: 11px;
		font-weight: 500;
		line-height: 20px;
		color: var( --wp-components-color-gray-900, var( --studio-gray-90 ) );
		flex: 0 0 auto;
	}
`;

export default function CreditCardLogos( {
	currency,
	isMobileCheckoutStickySummary = false,
}: {
	currency: string | null;
	isMobileCheckoutStickySummary?: boolean;
} ) {
	const Logos = isMobileCheckoutStickySummary ? CompactCreditCardLogos : PaymentMethodLogos;
	// Count only the additional brands advertised for this currency in the control strip.
	const overflowCount = currency === 'EUR' || currency === 'JPY' ? 1 : 0;

	return (
		<Logos className="credit-card__logos">
			{ ! isMobileCheckoutStickySummary && currency === 'EUR' && (
				<CBLogo className="has-background" />
			) }
			{ ! isMobileCheckoutStickySummary && currency === 'JPY' && <JcbLogo /> }
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
			{ isMobileCheckoutStickySummary && overflowCount > 0 && (
				<span className="credit-card__logos-overflow">{ `+${ overflowCount }` }</span>
			) }
		</Logos>
	);
}
