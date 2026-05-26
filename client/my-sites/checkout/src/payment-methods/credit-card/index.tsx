import { PaymentLogo } from '@automattic/wpcom-checkout';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
import {
	AmexLogo,
	CBLogo,
	JcbLogo,
	MastercardLogo,
	VisaLogo,
} from 'calypso/my-sites/checkout/src/components/payment-logos';
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/src/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/src/components/summary-details';
import { useMobileCheckoutStickySummaryExperiment } from 'calypso/my-sites/checkout/src/hooks/use-mobile-checkout-sticky-summary-experiment';
import CreditCardFields from './credit-card-fields';
import CreditCardPayButton from './credit-card-pay-button';
import type { WpcomCreditCardSelectors } from './store';
import type { CardFieldState, CardStoreType } from './types';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';

export { createCreditCardPaymentMethodStore } from './store';

function CreditCardSummary() {
	const fields: CardFieldState = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getFields(),
		[]
	);
	const cardholderName = fields.cardholderName;
	const brand: string = useSelect(
		( select ) => ( select( 'wpcom-credit-card' ) as WpcomCreditCardSelectors ).getBrand(),
		[]
	);

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName?.value }</SummaryLine>
			<SummaryLine>
				{ brand !== 'unknown' && '****' } <PaymentLogo brand={ brand } isSummary />
			</SummaryLine>
		</SummaryDetails>
	);
}

const CreditCardLabel: React.FC< {
	hasExistingCardMethods: boolean | undefined;
	currency: string | null;
} > = ( { hasExistingCardMethods, currency } ) => {
	const { __ } = useI18n();
	return (
		<Fragment>
			{ hasExistingCardMethods ? (
				<span>{ __( 'New credit or debit card' ) }</span>
			) : (
				<span>{ __( 'Credit or debit card' ) }</span>
			) }
			<CreditCardLogos currency={ currency } />
		</Fragment>
	);
};

function CreditCardLogos( { currency }: { currency: string | null } ) {
	const { isMobileCheckoutStickySummary } = useMobileCheckoutStickySummaryExperiment();

	// Under the mobile sticky experiment (Figma 3971:13250) the brand strip
	// renders as a fixed three-chip set — VISA / MasterCard / AMEX — with
	// a "+N" pill summarising the remaining card brands the platform
	// accepts. The N below mirrors what `PaymentLogo` knows how to draw
	// (cartes_bancaires, jcb, diners, discover, unionpay, plus any
	// currency-specific extras the default branch already conditionally
	// renders) so the count reads accurately regardless of currency.
	if ( isMobileCheckoutStickySummary ) {
		const overflowCount = currency === 'EUR' || currency === 'JPY' ? 3 : 2;
		return (
			<PaymentMethodLogos className="credit-card__logos">
				<VisaLogo />
				<MastercardLogo />
				<AmexLogo />
				<span className="credit-card__logos-overflow">{ `+${ overflowCount }` }</span>
			</PaymentMethodLogos>
		);
	}

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

export function createCreditCardMethod( {
	currency,
	store,
	shouldUseEbanx,
	shouldShowTaxFields,
	submitButtonContent,
	allowUseForAllSubscriptions,
	hasExistingCardMethods,
}: {
	currency: string | null;
	store: CardStoreType;
	shouldUseEbanx?: boolean;
	shouldShowTaxFields?: boolean;
	submitButtonContent: ReactNode;
	allowUseForAllSubscriptions?: boolean;
	hasExistingCardMethods?: boolean | undefined;
} ): PaymentMethod {
	return {
		id: 'card',
		paymentProcessorId: 'card',
		label: (
			<CreditCardLabel hasExistingCardMethods={ hasExistingCardMethods } currency={ currency } />
		),
		hasRequiredFields: true,
		activeContent: (
			<CreditCardFields
				shouldUseEbanx={ shouldUseEbanx }
				shouldShowTaxFields={ shouldShowTaxFields }
				allowUseForAllSubscriptions={ allowUseForAllSubscriptions }
			/>
		),
		submitButton: (
			<CreditCardPayButton
				store={ store }
				shouldUseEbanx={ shouldUseEbanx }
				submitButtonContent={ submitButtonContent }
			/>
		),
		inactiveContent: <CreditCardSummary />,
		getAriaLabel: ( __: ( text: string ) => string ) => __( 'Credit Card' ),
	};
}
