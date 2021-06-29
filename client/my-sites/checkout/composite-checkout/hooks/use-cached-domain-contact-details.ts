/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { defaultRegistry } from '@automattic/composite-checkout';
import type { UpdateTaxLocationInCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getCountries from 'calypso/state/selectors/get-countries';

const { dispatch } = defaultRegistry;

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

export default function useCachedDomainContactDetails(
	updateCartLocation: UpdateTaxLocationInCart
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
	const cachedDetailCountry = useSelector( ( state ) => getCountries( state, 'domains' ) )?.find(
		( country ) => country.code === cachedContactDetails?.countryCode
	);

	useEffect( () => {
		if ( cachedContactDetails ) {
			debug( 'using fetched cached domain contact details', cachedContactDetails );
			dispatch( 'wpcom' ).loadDomainContactDetailsFromCache( cachedContactDetails );
			dispatch( 'wpcom' ).updateRequiredDomainFields( {
				postalCode: cachedDetailCountry?.has_postal_codes ?? true,
			} );
		}
		if (
			cachedContactDetails?.countryCode ||
			cachedContactDetails?.postalCode ||
			cachedContactDetails?.state
		) {
			updateCartLocation( {
				countryCode: cachedContactDetails.countryCode ?? '',
				postalCode: cachedContactDetails.postalCode ?? '',
				subdivisionCode: cachedContactDetails.state ?? '',
			} );
		}
	}, [ cachedContactDetails, updateCartLocation, cachedDetailCountry ] );
}
