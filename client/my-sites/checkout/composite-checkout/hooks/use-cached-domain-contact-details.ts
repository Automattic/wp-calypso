import { useShoppingCart } from '@automattic/shopping-cart';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import type { CountryListItem } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

export default function useCachedDomainContactDetails( countriesList: CountryListItem[] ): void {
	const reduxDispatch = useReduxDispatch();
	const haveRequestedCachedDetails = useRef( false );
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

	const arePostalCodesSupported = cachedContactDetails
		? getCountryPostalCodeSupport( countriesList, cachedContactDetails.countryCode ?? '' )
		: false;

	const { loadDomainContactDetailsFromCache } = useDispatch( 'wpcom-checkout' );

	// When we have fetched or loaded contact details, send them to the
	// `wpcom-checkout` data store for use by the checkout contact form.
	useEffect( () => {
		if ( cachedContactDetails ) {
			debug( 'using fetched cached domain contact details', cachedContactDetails );
			loadDomainContactDetailsFromCache( {
				...cachedContactDetails,
				postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode : undefined,
			} );
		}
	}, [ cachedContactDetails, arePostalCodesSupported, loadDomainContactDetailsFromCache ] );

	// When we have fetched or loaded contact details, send them to the
	// to the shopping cart for calculating taxes.
	useEffect( () => {
		if ( isLoadingCart || cartLoadingError ) {
			return;
		}
		if (
			cachedContactDetails?.countryCode ||
			cachedContactDetails?.postalCode ||
			cachedContactDetails?.state
		) {
			updateCartLocation( {
				countryCode: cachedContactDetails.countryCode ?? '',
				postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode ?? '' : '',
				subdivisionCode: cachedContactDetails.state ?? '',
			} );
		}
	}, [
		cartLoadingError,
		isLoadingCart,
		cachedContactDetails,
		updateCartLocation,
		arePostalCodesSupported,
	] );
}
