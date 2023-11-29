import { useStripe } from '@automattic/calypso-stripe';
import { Dialog } from '@automattic/components';
import { CheckoutProvider } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useState, useMemo, useEffect } from 'react';
import QueryPaymentCountries from 'calypso/components/data/query-countries/payments';
import { isCreditCard, type StoredPaymentMethodCard } from 'calypso/lib/checkout/payment-methods';
import useCreatePaymentCompleteCallback from 'calypso/my-sites/checkout/src/hooks/use-create-payment-complete-callback';
import existingCardProcessor from 'calypso/my-sites/checkout/src/lib/existing-card-processor';
import getContactDetailsType from 'calypso/my-sites/checkout/src/lib/get-contact-details-type';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch, useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useStoredPaymentMethods } from '../../src/hooks/use-stored-payment-methods';
import { updateCartContactDetailsForCheckout } from '../../src/lib/update-cart-contact-details-for-checkout';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';
import { useSubmitTransaction } from './use-submit-transaction';
import type { MinimalRequestCartProduct, ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails, ManagedValue, VatDetails } from '@automattic/wpcom-checkout';
import type { PaymentProcessorOptions } from 'calypso/my-sites/checkout/src/types/payment-processors';

import './style.scss';

type PurchaseModalProps = {
	onClose: () => void;
	siteSlug: string;
	productToAdd: MinimalRequestCartProduct;
};

export function PurchaseModal( {
	cart,
	cards,
	isCartUpdating,
	onClose,
	siteSlug,
}: {
	cards: StoredPaymentMethodCard[];
	isCartUpdating: boolean;
	cart: ResponseCart;
	onClose: () => void;
	siteSlug: string;
} ) {
	const [ step, setStep ] = useState( BEFORE_SUBMIT );
	const submitTransaction = useSubmitTransaction( {
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

export function wrapValueInManagedValue( value: string | undefined ): ManagedValue {
	return {
		value: value ?? '',
		isTouched: true,
		errors: [],
	};
}

export default function PurchaseModalWrapper( props: PurchaseModalProps ) {
	const { onClose, productToAdd, siteSlug } = props;

	const onComplete = useCreatePaymentCompleteCallback( {
		isComingFromUpsell: true,
		siteSlug: siteSlug,
	} );
	const { stripe, stripeConfiguration } = useStripe();
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const { responseCart, updateLocation, replaceProductsInCart, isPendingUpdate } =
		useShoppingCart( cartKey );
	const selectedSite = useSelector( getSelectedSite );
	const paymentMethodsState = useStoredPaymentMethods( {
		type: 'card',
	} );
	const countries = useSelector( ( state ) => getCountries( state, 'payments' ) );

	const cards = paymentMethodsState.paymentMethods.filter( isCreditCard );
	const contactDetailsType = getContactDetailsType( responseCart );
	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	const storedCard = cards.length > 0 ? cards[ 0 ] : undefined;
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
				countryCode: wrapValueInManagedValue( storedCard?.tax_location?.country_code ),
				postalCode: wrapValueInManagedValue( storedCard?.tax_location?.postal_code ),
			},
		} ),
		[
			storedCard,
			includeDomainDetails,
			includeGSuiteDetails,
			stripe,
			stripeConfiguration,
			reduxDispatch,
			selectedSite,
			responseCart,
		]
	);

	useEffect( () => {
		let isUpdatingCart = false;

		if ( storedCard && countries?.length && ! isUpdatingCart ) {
			const vatDetails: VatDetails = {
				country: storedCard.tax_location?.country_code,
				id: storedCard.tax_location?.vat_id,
				name: storedCard.tax_location?.organization,
				address: storedCard.tax_location?.address,
			};
			const contactInfo: ManagedContactDetails = {
				state: wrapValueInManagedValue( storedCard.tax_location?.subdivision_code ),
				city: wrapValueInManagedValue( storedCard.tax_location?.city ),
				postalCode: wrapValueInManagedValue( storedCard.tax_location?.postal_code ),
			};

			updateCartContactDetailsForCheckout(
				countries ?? [],
				responseCart,
				updateLocation,
				contactInfo,
				vatDetails
			);
			replaceProductsInCart( [ productToAdd ] );
		}

		return () => {
			isUpdatingCart = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ replaceProductsInCart, updateLocation, storedCard, productToAdd, countries ] );

	const handleOnClose = () => {
		try {
			updateLocation( { countryCode: '' } );
			replaceProductsInCart( [] );
		} catch {
			// No need to do anything if this fails.
		}
		onClose();
	};

	return (
		<CheckoutProvider
			paymentMethods={ [] }
			onPaymentComplete={ onComplete }
			paymentProcessors={ {
				'existing-card': ( transactionData ) =>
					existingCardProcessor( transactionData, dataForProcessor ),
			} }
		>
			{ countries?.length === 0 && <QueryPaymentCountries /> }
			<PurchaseModal
				cards={ cards }
				isCartUpdating={ isPendingUpdate || ! countries?.length }
				cart={ responseCart }
				onClose={ handleOnClose }
				siteSlug={ siteSlug }
			/>
		</CheckoutProvider>
	);
}
