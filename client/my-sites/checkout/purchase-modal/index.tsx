import { useRazorpay } from '@automattic/calypso-razorpay';
import { useStripe } from '@automattic/calypso-stripe';
import { Dialog } from '@automattic/components';
import {
	CheckoutProvider,
	type PaymentEventCallbackArguments,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { getContactDetailsType } from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { useState, useMemo, useEffect, type PropsWithChildren } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isCreditCard, type StoredPaymentMethodCard } from 'calypso/lib/checkout/payment-methods';
import useCreatePaymentCompleteCallback from 'calypso/my-sites/checkout/src/hooks/use-create-payment-complete-callback';
import existingCardProcessor from 'calypso/my-sites/checkout/src/lib/existing-card-processor';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch, useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite, getSiteId } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import useCountryList from '../src/hooks/use-country-list';
import { useStoredPaymentMethods } from '../src/hooks/use-stored-payment-methods';
import { updateCartContactDetailsForCheckout } from '../src/lib/update-cart-contact-details-for-checkout';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';
import { useSubmitTransaction } from './use-submit-transaction';
import type { MinimalRequestCartProduct, ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails, ManagedValue, VatDetails } from '@automattic/wpcom-checkout';
import type { PaymentProcessorOptions } from 'calypso/my-sites/checkout/src/types/payment-processors';
import type { SiteSlug } from 'calypso/types';

import './style.scss';

type PurchaseModalProps = {
	onClose: () => void;
	siteSlug: string;
	productToAdd: MinimalRequestCartProduct;
	coupon?: string;
	showFeatureList: boolean;
} & (
	| {
			disabledThankYouPage?: never | false;
			onPurchaseSuccess?: never;
	  }
	| {
			onPurchaseSuccess: () => void;
			disabledThankYouPage: true;
	  }
);

function PurchaseModal( {
	cart,
	cards,
	isLoading,
	onClose,
	siteSlug,
	showFeatureList,
}: {
	cards: StoredPaymentMethodCard[];
	isLoading: boolean;
	cart: ResponseCart;
	onClose: () => void;
	siteSlug: string;
	showFeatureList: boolean;
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
		showFeatureList,
	};

	return (
		<Dialog
			isVisible
			baseClassName="purchase-modal dialog"
			className={ clsx( {
				'has-feature-list': showFeatureList,
			} ) }
			onClose={ onClose }
		>
			{ isLoading ? (
				<Placeholder showFeatureList={ showFeatureList } />
			) : (
				<Content { ...contentProps } />
			) }
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

function PurchaseModalWrapper( props: PurchaseModalProps ) {
	const {
		onClose,
		onPurchaseSuccess = null,
		disabledThankYouPage,
		productToAdd,
		coupon,
		siteSlug,
		showFeatureList,
	} = props;

	const paymentCompleteCallback = useCreatePaymentCompleteCallback( {
		isComingFromUpsell: true,
		siteSlug: siteSlug,
		isInModal: disabledThankYouPage,
		disabledThankYouPage,
	} );

	const handlePaymentComplete = ( args: PaymentEventCallbackArguments ) => {
		paymentCompleteCallback( args );
		onPurchaseSuccess?.();
	};

	const { stripe, stripeConfiguration } = useStripe();
	const { razorpayConfiguration } = useRazorpay();
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const { responseCart, updateLocation, replaceProductsInCart, isPendingUpdate, applyCoupon } =
		useShoppingCart( cartKey );
	const selectedSite = useSelector( getSelectedSite );
	const paymentMethodsState = useStoredPaymentMethods( {
		type: 'card',
	} );
	const countries = useCountryList();

	const selectedSiteId = useSelector( getSelectedSiteId );
	const isJetpackNotAtomic = useSelector(
		( state ) =>
			!! isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);
	const isAkismetSitelessCheckout = responseCart.products.some(
		( product ) => product.extra.isAkismetSitelessCheckout
	);

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
			isAkismetSitelessCheckout,
			isJetpackNotAtomic,
			reduxDispatch,
			responseCart,
			siteSlug: selectedSite?.slug ?? '',
			siteId: selectedSite?.ID,
			stripe,
			stripeConfiguration,
			razorpayConfiguration,
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
			razorpayConfiguration,
			reduxDispatch,
			selectedSite,
			responseCart,
			isAkismetSitelessCheckout,
			isJetpackNotAtomic,
		]
	);

	const [ requestSent, setRequestSent ] = useState( false );

	useEffect( () => {
		if ( storedCard && countries?.length && cartKey && cartKey !== 'no-site' && ! requestSent ) {
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

			setRequestSent( true );

			updateCartContactDetailsForCheckout(
				countries ?? [],
				responseCart,
				updateLocation,
				contactInfo,
				vatDetails
			);
			replaceProductsInCart( [ productToAdd ] );
			if ( coupon ) {
				applyCoupon( coupon );
			}
		}
	}, [
		replaceProductsInCart,
		updateLocation,
		storedCard,
		productToAdd,
		countries,
		selectedSite,
		cartKey,
		requestSent,
		setRequestSent,
		responseCart,
		applyCoupon,
		coupon,
	] );

	const handleOnClose = () => {
		if ( cartKey ) {
			Promise.all( [ updateLocation( { countryCode: '' } ), replaceProductsInCart( [] ) ] ).catch();
		}
		// We don't need to wait for the result of the above.
		onClose();
	};

	useEffect( () => {
		recordTracksEvent( 'calypso_oneclick_upsell_modal_view', {
			product_slug: productToAdd.product_slug,
		} );
	}, [ productToAdd.product_slug ] );

	return (
		<CheckoutProvider
			paymentMethods={ [] }
			onPaymentComplete={ handlePaymentComplete }
			paymentProcessors={ {
				'existing-card': ( transactionData ) =>
					existingCardProcessor( transactionData, dataForProcessor ),
			} }
		>
			<PurchaseModal
				cards={ cards }
				isLoading={ isPendingUpdate || ! countries?.length }
				cart={ responseCart }
				onClose={ handleOnClose }
				siteSlug={ siteSlug }
				showFeatureList={ showFeatureList }
			/>
		</CheckoutProvider>
	);
}

function EnsureSelectedSite( { siteSlug, children }: PropsWithChildren< { siteSlug: SiteSlug } > ) {
	const reduxDispatch = useDispatch();
	const selectedSite = useSelector( getSelectedSite );
	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );

	// Set the selected site if it is not set already.
	// This is necessary for the cart and post-purchase actions to function correctly.
	const hasSelectedSiteId = siteId === selectedSite?.ID;
	useEffect( () => {
		if ( ! hasSelectedSiteId && siteId ) {
			reduxDispatch( setSelectedSiteId( siteId ) );
		}
	}, [ hasSelectedSiteId, reduxDispatch, siteId ] );

	return hasSelectedSiteId ? children : null;
}

export default function ( props: PurchaseModalProps ) {
	return (
		<EnsureSelectedSite siteSlug={ props.siteSlug }>
			<PurchaseModalWrapper { ...props } />
		</EnsureSelectedSite>
	);
}
