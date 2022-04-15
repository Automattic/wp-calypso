import { useShoppingCart } from '@automattic/shopping-cart';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import useCountryList from './use-country-list';
import type {
	PossiblyCompleteDomainContactDetails,
	CountryListItem,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

function areTaxFieldsDifferent(
	previousTaxFields: PossiblyCompleteDomainContactDetails | undefined,
	nextTaxFields: PossiblyCompleteDomainContactDetails | undefined
): boolean {
	if (
		nextTaxFields?.countryCode === previousTaxFields?.countryCode &&
		nextTaxFields?.postalCode === previousTaxFields?.postalCode &&
		nextTaxFields?.state === previousTaxFields?.state
	) {
		return false;
	}
	return true;
}

/**
 * Load cached contact details from the server and use them to populate the
 * checkout contact form and the shopping cart tax location.
 */
export default function useCachedDomainContactDetails(
	overrideCountryList?: CountryListItem[]
): void {
	const reduxDispatch = useReduxDispatch();
	const countriesList = useCountryList( overrideCountryList );
	const haveRequestedCachedDetails = useRef( false );
	const previousDetailsForCart = useRef< PossiblyCompleteDomainContactDetails >();
	const previousDetailsForForm = useRef< PossiblyCompleteDomainContactDetails >();
	const cartKey = useCartKey();
	const {
		updateLocation: updateCartLocation,
		isLoading: isLoadingCart,
		loadingError: cartLoadingError,
	} = useShoppingCart( cartKey );

	useEffect( () => {
		if ( ! haveRequestedCachedDetails.current ) {
			debug( 'requesting cached domain contact details' );
			reduxDispatch( requestContactDetailsCache() );
			haveRequestedCachedDetails.current = true;
		}
	}, [ reduxDispatch ] );

	const cachedContactDetails = useSelector( getContactDetailsCache );

	const arePostalCodesSupported =
		countriesList.length && cachedContactDetails?.countryCode
			? getCountryPostalCodeSupport( countriesList, cachedContactDetails.countryCode )
			: true;

	const { loadDomainContactDetailsFromCache } = useDispatch( 'wpcom-checkout' );

	// When we have fetched or loaded contact details, send them to the
	// `wpcom-checkout` data store for use by the checkout contact form.
	useEffect( () => {
		// Do nothing if the contact details are loading, or the countries are loading.
		if ( ! cachedContactDetails || ! countriesList.length ) {
			return;
		}
		// Do nothing if the cached data has not changed since the last time we
		// sent the data to the form (this typically will only ever need to be
		// activated once).
		if ( previousDetailsForForm.current === cachedContactDetails ) {
			return;
		}
		previousDetailsForForm.current = cachedContactDetails;
		debug( 'using fetched cached domain contact details', cachedContactDetails );
		loadDomainContactDetailsFromCache( {
			...cachedContactDetails,
			postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode : undefined,
		} );
	}, [
		cachedContactDetails,
		arePostalCodesSupported,
		loadDomainContactDetailsFromCache,
		countriesList,
	] );

	// When we have fetched or loaded contact details, send them to the
	// to the shopping cart for calculating taxes.
	useEffect( () => {
		// Do nothing if the cart is loading, the contact details are loading, or the countries are loading.
		if ( isLoadingCart || cartLoadingError || ! cachedContactDetails || ! countriesList.length ) {
			return;
		}
		if (
			! cachedContactDetails.countryCode &&
			! cachedContactDetails.postalCode &&
			! cachedContactDetails.state
		) {
			return;
		}
		// Do nothing if the cached data has not changed since the last time we
		// sent the data to the cart endpoint (this typically will only ever need
		// to be activated once).
		if ( ! areTaxFieldsDifferent( previousDetailsForCart.current, cachedContactDetails ) ) {
			return;
		}
		previousDetailsForCart.current = cachedContactDetails;
		debug( 'updating cart tax details with cached contact details', cachedContactDetails );
		updateCartLocation( {
			countryCode: cachedContactDetails.countryCode ?? '',
			postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode ?? '' : '',
			subdivisionCode: cachedContactDetails.state ?? '',
		} );
	}, [
		cartLoadingError,
		isLoadingCart,
		cachedContactDetails,
		updateCartLocation,
		arePostalCodesSupported,
		countriesList,
	] );
}
