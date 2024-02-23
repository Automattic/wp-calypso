import config from '@automattic/calypso-config';
import { useSetStepComplete } from '@automattic/composite-checkout';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useQuery } from '@tanstack/react-query';
import { useDispatch as useWordPressDataDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef, useState } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { convertErrorToString } from '../lib/analytics';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import useCountryList from './use-country-list';
import type {
	PossiblyCompleteDomainContactDetails,
	CountryListItem,
	RawCachedDomainContactDetails,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:use-cached-domain-contact-details' );

async function fetchCachedContactDetails(): Promise< PossiblyCompleteDomainContactDetails > {
	const rawData: RawCachedDomainContactDetails = await wpcom.req.get(
		'/me/domain-contact-information'
	);
	return transformCachedContactDetailsToCamelCase( rawData );
}

function transformCachedContactDetailsToCamelCase(
	rawData: RawCachedDomainContactDetails
): PossiblyCompleteDomainContactDetails {
	return {
		firstName: rawData.first_name ?? null,
		lastName: rawData.last_name ?? null,
		organization: rawData.organization ?? null,
		email: rawData.email ?? null,
		phone: rawData.phone ?? null,
		address1: rawData.address_1 ?? null,
		address2: rawData.address_2 ?? null,
		city: rawData.city ?? null,
		state: rawData.state ?? null,
		postalCode: rawData.postal_code ?? null,
		countryCode: rawData.country_code ?? null,
		fax: rawData.fax ?? null,
	};
}

export function useCachedContactDetails( {
	isLoggedOut,
}: {
	isLoggedOut?: boolean;
} ): PossiblyCompleteDomainContactDetails | null {
	const queryKey = [ 'user-cached-contact-details' ];
	const result = useQuery( {
		queryKey,
		queryFn: fetchCachedContactDetails,
		enabled: ! isLoggedOut,
	} );
	return result.data ?? null;
}

function useCachedContactDetailsForCheckoutForm(
	cachedContactDetails: PossiblyCompleteDomainContactDetails | null,
	setShouldShowContactDetailsValidationErrors: ( allowed: boolean ) => void,
	overrideCountryList?: CountryListItem[]
): boolean {
	const countriesList = useCountryList( overrideCountryList );
	const reduxDispatch = useReduxDispatch();
	const setStepCompleteStatus = useSetStepComplete();
	const [ isComplete, setComplete ] = useState( false );
	const didFillForm = useRef( false );

	const arePostalCodesSupported =
		countriesList.length && cachedContactDetails?.countryCode
			? getCountryPostalCodeSupport( countriesList, cachedContactDetails.countryCode )
			: false;

	const checkoutStoreActions = useWordPressDataDispatch( CHECKOUT_STORE );
	if ( ! checkoutStoreActions?.loadDomainContactDetailsFromCache ) {
		throw new Error(
			'useCachedContactDetailsForCheckoutForm must be run after the checkout data store has been initialized'
		);
	}
	const { loadDomainContactDetailsFromCache } = checkoutStoreActions;

	const isMounted = useRef( true );
	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );

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
				if ( ! isMounted.current ) {
					return false;
				}
				if ( cachedContactDetails.countryCode ) {
					setShouldShowContactDetailsValidationErrors( false );
					debug( 'Contact details are populated; attempting to auto-complete all steps' );
					return setStepCompleteStatus( 'payment-method-step' );
				}
				return false;
			} )
			.then( ( didSkip: boolean ) => {
				if ( ! isMounted.current ) {
					return false;
				}
				if ( didSkip ) {
					reduxDispatch( recordTracksEvent( 'calypso_checkout_skip_to_last_step' ) );
				}
				setShouldShowContactDetailsValidationErrors( true );
				setComplete( true );
			} )
			.catch( ( error: Error ) => {
				setShouldShowContactDetailsValidationErrors( true );
				isMounted.current && setComplete( true );
				// eslint-disable-next-line no-console
				console.error( 'Error while autocompleting contact details:', error );
				logToLogstash( {
					feature: 'calypso_client',
					message: 'composite checkout autocomplete error',
					severity: config( 'env_id' ) === 'production' ? 'warning' : 'debug',
					extra: {
						env: config( 'env_id' ),
						type: 'checkout_contact_details_autocomplete',
						message: convertErrorToString( error ),
					},
				} );
			} );
	}, [
		setShouldShowContactDetailsValidationErrors,
		reduxDispatch,
		setStepCompleteStatus,
		cachedContactDetails,
		arePostalCodesSupported,
		loadDomainContactDetailsFromCache,
		countriesList,
	] );

	return isComplete;
}

/**
 * Load cached contact details from the server and use them to populate the
 * checkout contact form and the shopping cart tax location.
 */
export default function useCachedDomainContactDetails( {
	setShouldShowContactDetailsValidationErrors,
	isLoggedOut,
	overrideCountryList,
}: {
	setShouldShowContactDetailsValidationErrors: ( allowed: boolean ) => void;
	isLoggedOut?: boolean;
	overrideCountryList?: CountryListItem[];
} ): void {
	const cachedContactDetails = useCachedContactDetails( { isLoggedOut } );
	useCachedContactDetailsForCheckoutForm(
		cachedContactDetails,
		setShouldShowContactDetailsValidationErrors,
		overrideCountryList
	);
}
