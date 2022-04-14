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
import type { PossiblyCompleteDomainContactDetails } from '@automattic/wpcom-checkout';

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

function useArePostalCodesSupportedByCountry( country: string | undefined | null ): boolean {
	const countriesList = useCountryList();
	if ( ! country ) {
		return true;
	}
	if ( countriesList.length < 1 ) {
		debug( 'no country list available, so we are assuming postal codes exist' );
		return true;
	}
	return getCountryPostalCodeSupport( countriesList, country );
}

export default function useCachedDomainContactDetails(): void {
	const reduxDispatch = useReduxDispatch();
	const countriesList = useCountryList();
	const haveRequestedCachedDetails = useRef( false );
	const previousCachedContactDetails = useRef< PossiblyCompleteDomainContactDetails >();
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

	const arePostalCodesSupported = useArePostalCodesSupportedByCountry(
		cachedContactDetails?.countryCode
	);
	debug(
		'are postal codes supported by',
		cachedContactDetails?.countryCode,
		'?',
		arePostalCodesSupported
	);

	const { loadDomainContactDetailsFromCache } = useDispatch( 'wpcom-checkout' );

	// When we have fetched or loaded contact details, send them to the
	// `wpcom-checkout` data store for use by the checkout contact form.
	useEffect( () => {
		if ( ! cachedContactDetails || ! countriesList ) {
			return;
		}
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
		if ( isLoadingCart || cartLoadingError || ! cachedContactDetails || ! countriesList ) {
			return;
		}
		if (
			! cachedContactDetails.countryCode &&
			! cachedContactDetails.postalCode &&
			! cachedContactDetails.state
		) {
			return;
		}
		if ( ! areTaxFieldsDifferent( previousCachedContactDetails.current, cachedContactDetails ) ) {
			return;
		}
		debug( 'updating cart tax details with cached contact details', cachedContactDetails );
		updateCartLocation( {
			countryCode: cachedContactDetails.countryCode ?? '',
			postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode ?? '' : '',
			subdivisionCode: cachedContactDetails.state ?? '',
		} );
		previousCachedContactDetails.current = cachedContactDetails;
	}, [
		cartLoadingError,
		isLoadingCart,
		cachedContactDetails,
		updateCartLocation,
		arePostalCodesSupported,
		countriesList,
	] );
}
