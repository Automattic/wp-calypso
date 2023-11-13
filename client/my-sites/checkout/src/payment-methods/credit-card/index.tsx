import { PaymentLogo } from '@automattic/wpcom-checkout';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment } from 'react';
import {
	VisaLogo,
	MastercardLogo,
	AmexLogo,
} from 'calypso/my-sites/checkout/src/components/payment-logos';
import { PaymentMethodLogos } from 'calypso/my-sites/checkout/src/components/payment-method-logos';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/src/components/summary-details';
import CreditCardFields from './credit-card-fields';
import CreditCardPayButton from './credit-card-pay-button';
import type { WpcomCreditCardSelectors } from './store';
import type { CardFieldState, CardStoreType } from './types';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';

export { createCreditCardPaymentMethodStore } from './store';

export function createCreditCardMethod( {
	store,
	shouldUseEbanx,
	shouldShowTaxFields,
	submitButtonContent,
	allowUseForAllSubscriptions,
}: {
	store: CardStoreType;
	shouldUseEbanx?: boolean;
	shouldShowTaxFields?: boolean;
	submitButtonContent: ReactNode;
	allowUseForAllSubscriptions?: boolean;
} ): PaymentMethod {
	return {
		id: 'card',
		paymentProcessorId: 'card',
		label: <CreditCardLabel />,
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
				{ brand !== 'unknown' && '****' } <PaymentLogo brand={ brand } isSummary={ true } />
			</SummaryLine>
		</SummaryDetails>
	);
}

function CreditCardLabel() {
	const { __ } = useI18n();
	return (
		<Fragment>
			<span>{ __( 'Credit or debit card' ) }</span>
			<CreditCardLogos />
		</Fragment>
	);
}

function CreditCardLogos() {
	return (
		<PaymentMethodLogos className="credit-card__logo payment-logos">
			<VisaLogo />
			<MastercardLogo />
			<AmexLogo />
		</PaymentMethodLogos>
	);
}
