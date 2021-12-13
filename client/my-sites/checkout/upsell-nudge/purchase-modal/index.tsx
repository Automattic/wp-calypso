import { useStripe } from '@automattic/calypso-stripe';
import { Dialog } from '@automattic/components';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useCreatePaymentCompleteCallback from 'calypso/my-sites/checkout/composite-checkout/hooks/use-create-payment-complete-callback';
import existingCardProcessor from 'calypso/my-sites/checkout/composite-checkout/lib/existing-card-processor';
import getContactDetailsType from 'calypso/my-sites/checkout/composite-checkout/lib/get-contact-details-type';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';
import { useSubmitTransaction, extractStoredCardMetaValue } from './util';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedValue } from '@automattic/wpcom-checkout';
import type { PaymentProcessorOptions } from 'calypso/my-sites/checkout/composite-checkout/types/payment-processors';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

import './style.scss';

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
		errors: [],
	};
}

export default function PurchaseModalWrapper( props: PurchaseModalProps ): JSX.Element {
	const onComplete = useCreatePaymentCompleteCallback( {
		isComingFromUpsell: true,
		siteSlug: props.siteSlug,
	} );
	const { stripe, stripeConfiguration } = useStripe();
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
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
			reduxDispatch,
			responseCart,
			siteSlug: selectedSite?.slug ?? '',
			siteId: selectedSite?.ID,
			stripe,
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
			stripe,
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
			paymentProcessors={ {
				'existing-card': ( transactionData ) =>
					existingCardProcessor( transactionData, dataForProcessor ),
			} }
		>
			<PurchaseModal { ...props } />
		</CheckoutProvider>
	);
}
