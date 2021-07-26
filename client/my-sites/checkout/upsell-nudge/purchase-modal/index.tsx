/**
 * External dependencies
 */
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from '@automattic/components';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { useStripe } from '@automattic/calypso-stripe';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedValue } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import { useSubmitTransaction, extractStoredCardMetaValue } from './util';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';
import useCreatePaymentCompleteCallback from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-complete-callback';
import existingCardProcessor from 'calypso/my-sites/checkout/composite-checkout/lib/existing-card-processor';
import getContactDetailsType from 'calypso/my-sites/checkout/composite-checkout/lib/get-contact-details-type';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { PaymentProcessorOptions } from 'calypso/my-sites/checkout/composite-checkout/types/payment-processors';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => null;

type PurchaseModalProps = {
	cart: ResponseCart;
	cards: StoredCard[];
	isCartUpdating: boolean;
	onClose: () => void;
	siteSlug: string;
};

export function PurchaseModal( {
	cart,
	cards,
	isCartUpdating,
	onClose,
	siteSlug,
}: PurchaseModalProps ): JSX.Element {
	const [ step, setStep ] = useState( BEFORE_SUBMIT );
	const submitTransaction = useSubmitTransaction( {
		cart,
		setStep,
		storedCard: cards[ 0 ],
		onClose,
	} );
	const contentProps = {
		cards,
		cart,
		onClose,
		siteSlug,
		step,
		submitTransaction,
	};

	return (
		<Dialog isVisible={ true } baseClassName="purchase-modal dialog" onClose={ onClose }>
			{ isCartUpdating ? <Placeholder /> : <Content { ...contentProps } /> }
		</Dialog>
	);
}

function wrapValueInManagedValue( value: string | undefined ): ManagedValue {
	return {
		value: value ?? '',
		isTouched: true,
		isRequired: false,
		errors: [],
	};
}

export default function PurchaseModalWrapper( props: PurchaseModalProps ): JSX.Element {
	const onComplete = useCreatePaymentCompleteCallback( {
		isComingFromUpsell: true,
		siteSlug: props.siteSlug,
	} );
	const { stripeConfiguration } = useStripe();
	const reduxDispatch = useDispatch();
	const { responseCart } = useShoppingCart();
	const selectedSite = useSelector( getSelectedSite );

	const contactDetailsType = getContactDetailsType( props.cart );
	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	const storedCard = props.cards[ 0 ];
	const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
	const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );
	const dataForProcessor: PaymentProcessorOptions = useMemo(
		() => ( {
			createUserAndSiteBeforeTransaction: false,
			getThankYouUrl: () => '/plans',
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent: noop,
			reduxDispatch,
			responseCart,
			siteSlug: selectedSite?.slug ?? '',
			siteId: selectedSite?.ID,
			stripeConfiguration,
			contactDetails: {
				countryCode: wrapValueInManagedValue( countryCode ),
				postalCode: wrapValueInManagedValue( postalCode ),
			},
		} ),
		[
			countryCode,
			postalCode,
			includeDomainDetails,
			includeGSuiteDetails,
			stripeConfiguration,
			reduxDispatch,
			selectedSite,
			responseCart,
		]
	);

	return (
		<CheckoutProvider
			paymentMethods={ [] }
			onPaymentComplete={ onComplete }
			showErrorMessage={ noop }
			showInfoMessage={ noop }
			showSuccessMessage={ noop }
			paymentProcessors={ {
				'existing-card': ( transactionData ) =>
					existingCardProcessor( transactionData, dataForProcessor ),
			} }
		>
			<PurchaseModal { ...props } />
		</CheckoutProvider>
	);
}
