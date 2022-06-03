import { useSetStepComplete } from '@automattic/composite-checkout';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import useCountryList from './use-country-list';
import type {
	PossiblyCompleteDomainContactDetails,
	CountryListItem,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

function useCachedContactDetails(): PossiblyCompleteDomainContactDetails | null {
	const reduxDispatch = useReduxDispatch();
	const haveRequestedCachedDetails = useRef< 'not-started' | 'pending' | 'done' >( 'not-started' );
	const cachedContactDetails = useSelector( getContactDetailsCache );
	useEffect( () => {
		if ( haveRequestedCachedDetails.current === 'not-started' ) {
			debug( 'requesting cached domain contact details' );
			reduxDispatch( requestContactDetailsCache() );
			haveRequestedCachedDetails.current = 'pending';
		}
	}, [ reduxDispatch ] );
	if ( haveRequestedCachedDetails.current === 'pending' && cachedContactDetails ) {
		debug( 'cached domain contact details retrieved', cachedContactDetails );
		haveRequestedCachedDetails.current = 'done';
	}
	return cachedContactDetails;
}

function useCachedContactDetailsForCheckoutForm(
	cachedContactDetails: PossiblyCompleteDomainContactDetails | null,
	overrideCountryList?: CountryListItem[]
): void {
	const countriesList = useCountryList( overrideCountryList );
	const reduxDispatch = useReduxDispatch();
	const setStepCompleteStatus = useSetStepComplete();
	const didFillForm = useRef( false );

	const arePostalCodesSupported =
		countriesList.length && cachedContactDetails?.countryCode
			? getCountryPostalCodeSupport( countriesList, cachedContactDetails.countryCode )
			: false;

	const checkoutStoreActions = useDispatch( 'wpcom-checkout' );
	if ( ! checkoutStoreActions?.loadDomainContactDetailsFromCache ) {
		throw new Error(
			'useCachedContactDetailsForCheckoutForm must be run after the checkout data store has been initialized'
		);
	}
	// NOTE: the types for @wordpress/data actions imply that actions return void
	// but they actually return Promise< void > so I override this type here
	// until the actual types can be fixed.
	const { loadDomainContactDetailsFromCache } = checkoutStoreActions as {
		loadDomainContactDetailsFromCache: (
			info: PossiblyCompleteDomainContactDetails
		) => Promise< void >;
	};

	// When we have fetched or loaded contact details, send them to the
	// `wpcom-checkout` data store for use by the checkout contact form.
	useEffect( () => {
		// Once this activates, do not do it again.
		if ( didFillForm.current ) {
			return;
		}
		// Do nothing if the contact details are loading, or the countries are loading.
		if ( ! cachedContactDetails ) {
			debug( 'cached contact details for form have not loaded' );
			return;
		}
		if ( ! countriesList.length ) {
			debug( 'cached contact details for form are waiting for the countries list' );
			return;
		}
		debug( 'using fetched cached contact details for checkout data store', cachedContactDetails );
		didFillForm.current = true;
		loadDomainContactDetailsFromCache( {
			...cachedContactDetails,
			postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode : '',
		} )
			.then( () => {
				debug( 'Contact details are populated; attempting to skip to payment method step' );
				return setStepCompleteStatus( 'contact-form' );
			} )
			.then( ( didSkip: boolean ) => {
				if ( didSkip ) {
					reduxDispatch( recordTracksEvent( 'calypso_checkout_skip_to_last_step' ) );
				}
			} );
	}, [
		reduxDispatch,
		setStepCompleteStatus,
		cachedContactDetails,
		arePostalCodesSupported,
		loadDomainContactDetailsFromCache,
		countriesList,
	] );
}

/**
 * Load cached contact details from the server and use them to populate the
 * checkout contact form and the shopping cart tax location.
 */
export default function useCachedDomainContactDetails(
	overrideCountryList?: CountryListItem[]
): void {
	const cachedContactDetails = useCachedContactDetails();
	useCachedContactDetailsForCheckoutForm( cachedContactDetails, overrideCountryList );
}
