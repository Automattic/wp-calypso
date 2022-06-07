import { useSetStepComplete } from '@automattic/composite-checkout';
import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { useDispatch as useReduxDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useCountryList from './use-country-list';
import type {
	FetchedContactDetails,
	PossiblyCompleteDomainContactDetails,
	CountryListItem,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

function useCachedContactDetails(): PossiblyCompleteDomainContactDetails | null {
	const { data: cachedContactDetails, isFetching } = useQuery<
		PossiblyCompleteDomainContactDetails,
		Error
	>(
		'cached-contact-details',
		() =>
			wpcom.req
				.get( '/me/domain-contact-information' )
				.then( ( data: FetchedContactDetails ) =>
					mapRecordKeysRecursively( data, snakeToCamelCase )
				),
		{ refetchOnMount: 'always' }
	);
	return isFetching ? null : cachedContactDetails ?? null;
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
	const { loadDomainContactDetailsFromCache } = checkoutStoreActions;

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
		// NOTE: the types for `@wordpress/data` actions imply that actions return
		// `void` by default but they actually return `Promise<void>` so I override
		// this type here until the actual types can be improved. See
		// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60693
		loadDomainContactDetailsFromCache< Promise< void > >( {
			...cachedContactDetails,
			postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode : '',
		} )
			.then( () => {
				if ( cachedContactDetails.countryCode ) {
					debug( 'Contact details are populated; attempting to skip to payment method step' );
					return setStepCompleteStatus( 'contact-form' );
				}
				return false;
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
