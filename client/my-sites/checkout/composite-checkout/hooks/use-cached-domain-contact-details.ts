import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import type { UpdateTaxLocationInCart } from '@automattic/shopping-cart';
import type { CountryListItem } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

export default function useCachedDomainContactDetails(
	updateCartLocation: UpdateTaxLocationInCart,
	countriesList: CountryListItem[]
): void {
	const reduxDispatch = useReduxDispatch();
	const haveRequestedCachedDetails = useRef( false );

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

	const { loadDomainContactDetailsFromCache } = useDispatch( 'wpcom' );

	useEffect( () => {
		if ( cachedContactDetails ) {
			debug( 'using fetched cached domain contact details', cachedContactDetails );
			loadDomainContactDetailsFromCache( {
				...cachedContactDetails,
				postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode : undefined,
			} );
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
		cachedContactDetails,
		updateCartLocation,
		arePostalCodesSupported,
		loadDomainContactDetailsFromCache,
	] );
}
