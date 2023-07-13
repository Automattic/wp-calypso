import {
	Button,
	FormStatus,
	useTotal,
	useFormStatus,
	PaymentLogo,
} from '@automattic/composite-checkout';
import { styled } from '@automattic/wpcom-checkout';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import MaterialIcon from 'calypso/components/material-icon';
import {
	TaxInfoArea,
	usePaymentMethodTaxInfo,
	getMissingTaxLocationInformationMessage,
} from 'calypso/my-sites/checkout/composite-checkout/components/payment-method-tax-info';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import type { PaymentMethod, ProcessPayment, LineItem } from '@automattic/composite-checkout';

const debug = debugFactory( 'calypso:existing-card-payment-method' );

export function createExistingCardMethod( {
	id,
	cardholderName,
	cardExpiry,
	brand,
	last4,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	activePayButtonText,
	allowEditingTaxInfo,
	isTaxInfoRequired,
}: {
	id: string;
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	activePayButtonText?: string;
	allowEditingTaxInfo?: boolean;
	isTaxInfoRequired?: boolean;
} ): PaymentMethod {
	debug( 'creating a new existing credit card payment method', {
		id,
		cardholderName,
		cardExpiry,
		brand,
		last4,
	} );

	return {
		id,
		paymentProcessorId:
			paymentPartnerProcessorId === 'ebanx' ? 'existing-card-ebanx' : 'existing-card',
		label: (
			<ExistingCardLabel
				last4={ last4 }
				storedDetailsId={ storedDetailsId }
				cardExpiry={ cardExpiry }
				cardholderName={ cardholderName }
				brand={ brand }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				allowEditingTaxInfo={ allowEditingTaxInfo }
			/>
		),
		submitButton: (
			<ExistingCardPayButton
				cardholderName={ cardholderName }
				storedDetailsId={ storedDetailsId }
				paymentMethodToken={ paymentMethodToken }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				activeButtonText={ activePayButtonText }
				isTaxInfoRequired={ isTaxInfoRequired }
			/>
		),
		inactiveContent: (
			<ExistingCardSummary
				cardholderName={ cardholderName }
				cardExpiry={ cardExpiry }
				brand={ brand }
				last4={ last4 }
			/>
		),
		getAriaLabel: () => `${ brand } ${ last4 } ${ cardholderName }`,
	};
}

function formatDate( cardExpiry: string ): string {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}

const CardDetails = styled.span`
	display: inline-block;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const CardHolderName = styled.span`
	display: block;
`;

function ExistingCardLabel( {
	last4,
	cardExpiry,
	cardholderName,
	brand,
	storedDetailsId,
	paymentPartnerProcessorId,
	allowEditingTaxInfo,
}: {
	last4: string;
	cardExpiry: string;
	cardholderName: string;
	brand: string;
	storedDetailsId: string;
	paymentPartnerProcessorId: string;
	allowEditingTaxInfo?: boolean;
} ) {
	const { __, _x } = useI18n();

	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<Fragment>
			<div>
				<CardHolderName>{ cardholderName }</CardHolderName>
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
				{ allowEditingTaxInfo && (
					<TaxInfoArea
						last4={ last4 }
						brand={ brand }
						storedDetailsId={ storedDetailsId }
						paymentPartnerProcessorId={ paymentPartnerProcessorId }
					/>
				) }
			</div>
			<div className="existing-credit-card__logo payment-logos">
				<PaymentLogo brand={ brand } isSummary={ true } />
			</div>
		</Fragment>
	);
}

function ExistingCardPayButton( {
	disabled,
	onClick,
	cardholderName,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	activeButtonText,
	isTaxInfoRequired,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	cardholderName: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	activeButtonText?: string;
	isTaxInfoRequired?: boolean;
} ) {
	const total = useTotal();
	const { formStatus } = useFormStatus();
	const translate = useTranslate();

	const { taxInfo: taxInfoFromServer, isLoading: isLoadingTaxInfo } = usePaymentMethodTaxInfo(
		storedDetailsId,
		{ doNotFetch: ! isTaxInfoRequired }
	);

	const dispatch = useDispatch();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; ExistingCardPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled || isLoadingTaxInfo }
			onClick={ () => {
				debug( 'submitting existing card payment' );
				if ( isTaxInfoRequired && ! taxInfoFromServer?.is_tax_info_set ) {
					dispatch(
						errorNotice( getMissingTaxLocationInformationMessage( translate, taxInfoFromServer ) )
					);
				} else {
					onClick( {
						name: cardholderName,
						storedDetailsId,
						paymentMethodToken,
						paymentPartnerProcessorId,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents
				formStatus={ formStatus }
				total={ total }
				activeButtonText={ activeButtonText }
			/>
		</Button>
	);
}

const CreditCardPayButtonWrapper = styled[ 'span' ]`
	display: inline-flex;
	align-items: flex-end;
`;

const StyledMaterialIcon = styled( MaterialIcon )`
	fill: ${ ( { theme } ) => theme.colors.surface };
	margin-right: 0.7em;

	.rtl & {
		margin-right: 0;
		margin-left: 0.7em;
	}
`;

function ButtonContents( {
	formStatus,
	total,
	activeButtonText,
}: {
	formStatus: string;
	total: LineItem;
	activeButtonText?: string;
} ) {
	const { __ } = useI18n();
	const isPurchaseFree = total.amount.value === 0;
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY && isPurchaseFree ) {
		const defaultText = (
			<CreditCardPayButtonWrapper>
				<StyledMaterialIcon icon="credit_card" />
				{ __( 'Complete Checkout' ) }
			</CreditCardPayButtonWrapper>
		);
		/* translators: %s is the total to be paid in localized currency */
		return <>{ activeButtonText || defaultText }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		const defaultText = (
			<CreditCardPayButtonWrapper>
				<StyledMaterialIcon icon="credit_card" />
				{ sprintf(
					/* translators: %s is the total to be paid in localized currency */
					__( 'Pay %s now' ),
					total.amount.displayValue
				) }
			</CreditCardPayButtonWrapper>
		);
		/* translators: %s is the total to be paid in localized currency */
		return <>{ activeButtonText || defaultText }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function ExistingCardSummary( {
	cardholderName,
	cardExpiry,
	brand,
	last4,
}: {
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
} ) {
	const { __, _x } = useI18n();

	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				<PaymentLogo brand={ brand } isSummary={ true } />
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
			</SummaryLine>
		</SummaryDetails>
	);
}
