/**
 * External dependencies
 */
import page from 'page';
import wp from 'lib/wp';
import React, { useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';
import {
	WPCheckout,
	useWpcomStore,
	useShoppingCart,
	FormFieldAnnotation,
	areDomainsInLineItems,
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
} from 'my-sites/checkout/composite-checkout/wpcom';
import { CheckoutProvider, defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { requestPlans } from 'state/plans/actions';
import {
	computeProductsWithPrices,
	getProductsList,
	isProductsListFetching,
} from 'state/products-list/selectors';
import {
	useStoredCards,
	useIsApplePayAvailable,
	filterAppropriatePaymentMethods,
} from './payment-method-helpers';
import usePrepareProductsForCart, {
	useFetchProductsIfNotLoaded,
} from './use-prepare-product-for-cart';
import notices from 'notices';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import {
	requestContactDetailsCache,
	updateContactDetailsCache,
} from 'state/domains/management/actions';
import { FormCountrySelect } from 'components/forms/form-country-select';
import getCountries from 'state/selectors/get-countries';
import { fetchPaymentCountries } from 'state/countries/actions';
import { StateSelect } from 'my-sites/domains/components/form';
import ContactDetailsFormFields from 'components/domains/contact-details-form-fields';
import { getPlan, findPlansKeys } from 'lib/plans';
import { GROUP_WPCOM, TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { requestProductsList } from 'state/products-list/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { useStripe } from 'lib/stripe';
import CheckoutTerms from '../checkout/checkout-terms.jsx';
import useShowStripeLoadingErrors from './use-show-stripe-loading-errors';
import useCreatePaymentMethods from './use-create-payment-methods';
import { useGetThankYouUrl } from './use-get-thank-you-url';
import createAnalyticsEventHandler from './record-analytics';
import createContactValidationCallback from './contact-validation';
import { fillInSingleCartItemAttributes } from 'lib/cart-values';

const debug = debugFactory( 'calypso:composite-checkout' );

const { dispatch, registerStore } = defaultRegistry;

const wpcom = wp.undocumented();

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomGetCart = ( ...args ) => wpcom.getCart( ...args );
const wpcomSetCart = ( ...args ) => wpcom.setCart( ...args );
const wpcomGetStoredCards = ( ...args ) => wpcom.getStoredCards( ...args );
const wpcomValidateDomainContactInformation = ( ...args ) =>
	wpcom.validateDomainContactInformation( ...args );

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	product,
	getCart,
	setCart,
	getStoredCards,
	validateDomainContactDetails,
	allowedPaymentMethods,
	onlyLoadPaymentMethods,
	overrideCountryList,
	redirectTo,
	feature,
	plan,
	purchaseId,
	cart,
	couponCode: couponCodeFromUrl,
} ) {
	const translate = useTranslate();
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const isLoadingCartSynchronizer =
		cart && ( ! cart.hasLoadedFromServer || cart.hasPendingServerUpdates );

	const getThankYouUrl = useGetThankYouUrl( {
		siteSlug,
		redirectTo,
		purchaseId,
		feature,
		cart,
		isJetpackNotAtomic,
		product,
		siteId,
	} );
	const reduxDispatch = useDispatch();
	const recordEvent = useCallback( createAnalyticsEventHandler( reduxDispatch ), [] );

	useEffect( () => {
		debug( 'composite checkout has loaded' );
		recordEvent( { type: 'CHECKOUT_LOADED' } );
	}, [ recordEvent ] );

	const showErrorMessage = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ) );
		},
		[ translate ]
	);

	const showErrorMessageBriefly = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ), {
				duration: 5000,
			} );
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( ( message ) => {
		debug( 'info', message );
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( ( message ) => {
		debug( 'success', message );
		notices.success( message );
	}, [] );

	const showAddCouponSuccessMessage = ( couponCode ) => {
		showSuccessMessage(
			translate( "The '%(couponCode)s' coupon was successfully applied to your shopping cart.", {
				args: { couponCode },
			} )
		);
	};

	useShowStripeLoadingErrors( showErrorMessage, stripeLoadingError );

	const countriesList = useCountryList( overrideCountryList || [] );

	const { productsForCart, canInitializeCart } = usePrepareProductsForCart( {
		siteId,
		product,
		purchaseId,
		isJetpackNotAtomic,
	} );

	useFetchProductsIfNotLoaded();
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );

	const {
		items,
		tax,
		couponItem,
		total,
		credits,
		removeItem,
		submitCoupon,
		removeCoupon,
		updateLocation,
		couponStatus,
		changeItemVariant,
		errors,
		subtotal,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		allowedPaymentMethods: serverAllowedPaymentMethods,
		variantRequestStatus,
		variantSelectOverride,
		responseCart,
		addItem,
	} = useShoppingCart(
		siteSlug,
		canInitializeCart && ! isLoadingCartSynchronizer && ! isFetchingProducts,
		productsForCart,
		couponCodeFromUrl,
		setCart || wpcomSetCart,
		getCart || wpcomGetCart,
		translate,
		showAddCouponSuccessMessage,
		recordEvent
	);

	const onPaymentComplete = useCallback(
		( { paymentMethodId } ) => {
			debug( 'payment completed successfully' );
			const url = getThankYouUrl();
			recordEvent( {
				type: 'PAYMENT_COMPLETE',
				payload: { url, couponItem, paymentMethodId, total, responseCart },
			} );
			page.redirect( url );
		},
		[ recordEvent, getThankYouUrl, total, couponItem, responseCart ]
	);

	useWpcomStore(
		registerStore,
		recordEvent,
		applyContactDetailsRequiredMask(
			emptyManagedContactDetails,
			areDomainsInLineItems( items ) ? domainRequiredContactDetails : taxRequiredContactDetails
		),
		updateContactDetailsCache
	);

	useCachedDomainContactDetails();

	useDisplayErrors( errors, showErrorMessage );

	const itemsForCheckout = ( items.length ? [ ...items, tax, couponItem ] : [] ).filter( Boolean );
	debug( 'items for checkout', itemsForCheckout );

	useRedirectIfCartEmpty( items, `/plans/${ siteSlug || '' }`, isLoadingCart );

	const { storedCards, isLoading: isLoadingStoredCards } = useStoredCards(
		getStoredCards || wpcomGetStoredCards
	);
	const {
		canMakePayment: isApplePayAvailable,
		isLoading: isApplePayLoading,
	} = useIsApplePayAvailable( stripe, stripeConfiguration, !! stripeLoadingError, items );

	const paymentMethodObjects = useCreatePaymentMethods( {
		onlyLoadPaymentMethods,
		getThankYouUrl,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		credits,
		items,
		couponItem,
		isApplePayAvailable,
		isApplePayLoading,
		storedCards,
	} );

	// Once we pass paymentMethods into CompositeCheckout, we should try to avoid
	// changing them because it can cause awkward UX. Here we try to wait for
	// them to be all finished loading before we pass them along.
	const arePaymentMethodsLoading =
		items.length < 1 ||
		isLoadingCart ||
		isLoadingStoredCards ||
		( onlyLoadPaymentMethods
			? onlyLoadPaymentMethods.includes( 'apple-pay' ) && isApplePayLoading
			: isApplePayLoading );

	const paymentMethods = arePaymentMethodsLoading
		? []
		: filterAppropriatePaymentMethods( {
				paymentMethodObjects,
				total,
				credits,
				subtotal,
				allowedPaymentMethods,
				serverAllowedPaymentMethods,
		  } );

	const domainContactValidationCallback = createContactValidationCallback( {
		validateDomainContact: validateDomainContactDetails || wpcomValidateDomainContactInformation,
		recordEvent,
		showErrorMessage: showErrorMessageBriefly,
		translate,
	} );

	const renderDomainContactFields = (
		contactDetails,
		contactDetailsErrors,
		updateDomainContactFields,
		shouldShowContactDetailsValidationErrors,
		isDisabled
	) => {
		const getIsFieldDisabled = () => isDisabled;
		return (
			<ContactDetailsFormFields
				countriesList={ countriesList }
				contactDetails={ contactDetails }
				contactDetailsErrors={
					shouldShowContactDetailsValidationErrors ? contactDetailsErrors : {}
				}
				onContactDetailsChange={ updateDomainContactFields }
				shouldForceRenderOnPropChange={ true }
				getIsFieldDisabled={ getIsFieldDisabled }
			/>
		);
	};

	const getItemVariants = useWpcomProductVariants( {
		siteId,
		productSlug: getPlanProductSlugs( items )[ 0 ],
	} );

	const { analyticsPath, analyticsProps } = getAnalyticsPath(
		purchaseId,
		product,
		siteSlug,
		feature,
		plan
	);

	const products = useSelector( ( state ) => getProductsList( state ) );

	// Often products are added using just the product_slug but missing the
	// product_id; this adds it.
	const addItemWithEssentialProperties = useCallback(
		( cartItem ) => addItem( fillInSingleCartItemAttributes( cartItem, products ) ),
		[ addItem, products ]
	);

	return (
		<React.Fragment>
			<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
			<CheckoutProvider
				locale={ 'en-us' }
				items={ itemsForCheckout }
				total={ total }
				onPaymentComplete={ onPaymentComplete }
				showErrorMessage={ showErrorMessage }
				showInfoMessage={ showInfoMessage }
				showSuccessMessage={ showSuccessMessage }
				onEvent={ recordEvent }
				paymentMethods={ paymentMethods }
				registry={ defaultRegistry }
				isLoading={
					isLoadingCart || isLoadingStoredCards || paymentMethods.length < 1 || items.length < 1
				}
				isValidating={ isCartPendingUpdate }
			>
				<WPCheckout
					removeItem={ removeItem }
					updateLocation={ updateLocation }
					submitCoupon={ submitCoupon }
					removeCoupon={ removeCoupon }
					couponStatus={ couponStatus }
					changePlanLength={ changeItemVariant }
					siteId={ siteId }
					siteUrl={ siteSlug }
					CountrySelectMenu={ CountrySelectMenu }
					countriesList={ countriesList }
					StateSelect={ StateSelect }
					renderDomainContactFields={ renderDomainContactFields }
					variantRequestStatus={ variantRequestStatus }
					variantSelectOverride={ variantSelectOverride }
					getItemVariants={ getItemVariants }
					domainContactValidationCallback={ domainContactValidationCallback }
					responseCart={ responseCart }
					addItemToCart={ addItemWithEssentialProperties }
					subtotal={ subtotal }
					isCartPendingUpdate={ isCartPendingUpdate }
					CheckoutTerms={ CheckoutTerms }
				/>
			</CheckoutProvider>
		</React.Fragment>
	);
}

CompositeCheckout.propTypes = {
	siteSlug: PropTypes.string,
	siteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	product: PropTypes.string,
	getCart: PropTypes.func,
	setCart: PropTypes.func,
	getStoredCards: PropTypes.func,
	allowedPaymentMethods: PropTypes.array,
	redirectTo: PropTypes.string,
	feature: PropTypes.string,
	plan: PropTypes.string,
	cart: PropTypes.object,
	transaction: PropTypes.object,
};

function useDisplayErrors( errors, displayError ) {
	useEffect( () => {
		errors.filter( isNotCouponError ).map( ( error ) => displayError( error.message ) );
	}, [ errors, displayError ] );
}

function isNotCouponError( error ) {
	const couponErrorCodes = [
		'coupon-not-found',
		'coupon-already-used',
		'coupon-no-longer-valid',
		'coupon-expired',
		'coupon-unknown-error',
	];
	return ! couponErrorCodes.includes( error.code );
}

function useRedirectIfCartEmpty( items, redirectUrl, isLoading ) {
	const [ prevItemsLength, setPrevItemsLength ] = useState( 0 );

	useEffect( () => {
		setPrevItemsLength( items.length );
	}, [ items ] );

	useEffect( () => {
		if ( prevItemsLength > 0 && items.length === 0 ) {
			debug( 'cart has become empty; redirecting...' );
			page.redirect( redirectUrl );
			return;
		}
		if ( ! isLoading && items.length === 0 ) {
			debug( 'cart is empty and not still loading; redirecting...' );
			page.redirect( redirectUrl );
			return;
		}
	}, [ redirectUrl, items, prevItemsLength, isLoading ] );
}

function useCountryList( overrideCountryList ) {
	// Should we fetch the country list from global state?
	const shouldFetchList = overrideCountryList?.length <= 0;

	const [ countriesList, setCountriesList ] = useState( overrideCountryList );

	const reduxDispatch = useDispatch();
	const globalCountryList = useSelector( ( state ) => getCountries( state, 'payments' ) );

	// Has the global list been populated?
	const isListFetched = globalCountryList?.length > 0;

	useEffect( () => {
		if ( shouldFetchList ) {
			if ( isListFetched ) {
				setCountriesList( globalCountryList );
			} else {
				debug( 'countries list is empty; dispatching request for data' );
				reduxDispatch( fetchPaymentCountries() );
			}
		}
	}, [ shouldFetchList, isListFetched, globalCountryList, reduxDispatch ] );

	return countriesList;
}

function CountrySelectMenu( {
	translate,
	onChange,
	isDisabled,
	isError,
	errorMessage,
	currentValue,
	countriesList,
} ) {
	const countrySelectorId = 'country-selector';
	const countrySelectorLabelId = 'country-selector-label';
	const countrySelectorDescriptionId = 'country-selector-description';

	return (
		<FormFieldAnnotation
			labelText={ translate( 'Country' ) }
			isError={ isError }
			isDisabled={ isDisabled }
			formFieldId={ countrySelectorId }
			labelId={ countrySelectorLabelId }
			descriptionId={ countrySelectorDescriptionId }
			errorDescription={ errorMessage }
		>
			<FormCountrySelect
				id={ countrySelectorId }
				countriesList={ [
					{ code: '', name: translate( 'Select Country' ) },
					{ code: null, name: '' },
					...countriesList,
				] }
				translate={ translate }
				onChange={ onChange }
				disabled={ isDisabled }
				value={ currentValue }
				aria-labelledby={ countrySelectorLabelId }
				aria-describedby={ countrySelectorDescriptionId }
			/>
		</FormFieldAnnotation>
	);
}

function getTermText( term, translate ) {
	switch ( term ) {
		case TERM_BIENNIALLY:
			return translate( 'Two years' );

		case TERM_ANNUALLY:
			return translate( 'One year' );

		case TERM_MONTHLY:
			return translate( 'One month' );
	}
}

// TODO: replace this with a real localize function
function localizeCurrency( amount ) {
	const decimalAmount = ( amount / 100 ).toFixed( 2 );
	return `$${ decimalAmount }`;
}

function useWpcomProductVariants( { siteId, productSlug, credits, couponDiscounts } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const availableVariants = useVariantWpcomPlanProductSlugs( productSlug );

	const productsWithPrices = useSelector( ( state ) => {
		return computeProductsWithPrices(
			state,
			siteId,
			availableVariants, // : WPCOMProductSlug[]
			credits || 0, // : number
			couponDiscounts || {} // object of product ID / absolute amount pairs
		);
	} );

	const [ haveFetchedProducts, setHaveFetchedProducts ] = useState( false );
	const shouldFetchProducts = ! productsWithPrices;

	useEffect( () => {
		// Trigger at most one HTTP request
		debug( 'deciding whether to request product variant data' );
		if ( shouldFetchProducts && ! haveFetchedProducts ) {
			debug( 'dispatching request for product variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedProducts( true );
		}
	}, [ shouldFetchProducts, haveFetchedProducts, reduxDispatch ] );

	return ( anyProductSlug ) => {
		if ( anyProductSlug !== productSlug ) {
			return [];
		}

		const highestMonthlyPrice = Math.max(
			...productsWithPrices.map( ( variant ) => {
				return variant.priceMonthly;
			} )
		);

		const percentSavings = ( monthlyPrice ) => {
			const savings = Math.round( 100 * ( 1 - monthlyPrice / highestMonthlyPrice ) );
			return savings > 0 ? <Discount>-{ savings.toString() }%</Discount> : null;
		};

		// What the customer would pay if using the
		// most expensive schedule
		const highestTermPrice = ( term ) => {
			if ( term !== TERM_BIENNIALLY ) {
				return;
			}
			const annualPrice = Math.round( 100 * 24 * highestMonthlyPrice );
			return <DoNotPayThis>{ localizeCurrency( annualPrice, 'USD' ) }</DoNotPayThis>;
		};

		return productsWithPrices.map( ( variant ) => {
			const label = getTermText( variant.plan.term, translate );
			const price = (
				<React.Fragment>
					{ percentSavings( variant.priceMonthly ) }
					{ highestTermPrice( variant.plan.term ) }
					{ variant.product.cost_display }
				</React.Fragment>
			);

			return {
				variantLabel: label,
				variantDetails: price,
				productSlug: variant.planSlug,
				productId: variant.product.product_id,
			};
		} );
	};
}

function useVariantWpcomPlanProductSlugs( productSlug ) {
	const reduxDispatch = useDispatch();

	const chosenPlan = getPlan( productSlug );

	const [ haveFetchedPlans, setHaveFetchedPlans ] = useState( false );
	const shouldFetchPlans = ! chosenPlan;

	useEffect( () => {
		// Trigger at most one HTTP request
		debug( 'deciding whether to request plan variant data' );
		if ( shouldFetchPlans && ! haveFetchedPlans ) {
			debug( 'dispatching request for plan variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedPlans( true );
		}
	}, [ haveFetchedPlans, shouldFetchPlans, reduxDispatch ] );

	if ( ! chosenPlan ) {
		return [];
	}

	// Only construct variants for WP.com plans
	if ( chosenPlan.group !== GROUP_WPCOM ) {
		return [];
	}

	// : WPCOMProductSlug[]
	return findPlansKeys( {
		group: chosenPlan.group,
		type: chosenPlan.type,
	} );
}

function useCachedDomainContactDetails() {
	const reduxDispatch = useDispatch();
	const [ haveRequestedCachedDetails, setHaveRequestedCachedDetails ] = useState( false );

	useEffect( () => {
		// Dispatch exactly once
		if ( ! haveRequestedCachedDetails ) {
			debug( 'requesting cached domain contact details' );
			reduxDispatch( requestContactDetailsCache() );
			setHaveRequestedCachedDetails( true );
		}
	}, [ haveRequestedCachedDetails, reduxDispatch ] );

	const cachedContactDetails = useSelector( getContactDetailsCache );
	if ( cachedContactDetails ) {
		dispatch( 'wpcom' ).loadDomainContactDetailsFromCache( cachedContactDetails );
	}
}

function getPlanProductSlugs(
	items // : WPCOMCart
) /* : WPCOMCartItem[] */ {
	return items
		.filter( ( item ) => {
			return item.type !== 'tax' && getPlan( item.wpcom_meta.product_slug );
		} )
		.map( ( item ) => item.wpcom_meta.product_slug );
}

const Discount = styled.span`
	color: ${( props ) => props.theme.colors.discount};
	margin-right: 8px;
`;

const DoNotPayThis = styled.span`
	text-decoration: line-through;
	margin-right: 8px;
`;

function getAnalyticsPath( purchaseId, product, selectedSiteSlug, selectedFeature, plan ) {
	debug( 'getAnalyticsPath', { purchaseId, product, selectedSiteSlug, selectedFeature, plan } );
	let analyticsPath = '';
	let analyticsProps = {};
	if ( purchaseId && product ) {
		analyticsPath = '/checkout/:product/renew/:purchase_id/:site';
		analyticsProps = { product, purchase_id: purchaseId, site: selectedSiteSlug };
	} else if ( selectedFeature && plan ) {
		analyticsPath = '/checkout/features/:feature/:site/:plan';
		analyticsProps = { feature: selectedFeature, plan, site: selectedSiteSlug };
	} else if ( selectedFeature && ! plan ) {
		analyticsPath = '/checkout/features/:feature/:site';
		analyticsProps = { feature: selectedFeature, site: selectedSiteSlug };
	} else if ( product && ! purchaseId ) {
		analyticsPath = '/checkout/:site/:product';
		analyticsProps = { product, site: selectedSiteSlug };
	} else if ( selectedSiteSlug ) {
		analyticsPath = '/checkout/:site';
		analyticsProps = { site: selectedSiteSlug };
	} else {
		analyticsPath = '/checkout/no-site';
	}
	return { analyticsPath, analyticsProps };
}
