import config from '@automattic/calypso-config';
import { useSetStepComplete } from '@automattic/composite-checkout';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef, useState } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSelector, useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestContactDetailsCache } from 'calypso/state/domains/management/actions';
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';
import { convertErrorToString } from '../lib/analytics';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import useCountryList from './use-country-list';
import { useShouldCollapseLastStep } from './use-should-collapse-last-step';
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

	const checkoutStoreActions = useDispatch( CHECKOUT_STORE );
	if ( ! checkoutStoreActions?.loadDomainContactDetailsFromCache ) {
		throw new Error(
			'useCachedContactDetailsForCheckoutForm must be run after the checkout data store has been initialized'
		);
	}
	const { loadDomainContactDetailsFromCache } = checkoutStoreActions;

	const shouldCollapseLastStep = useShouldCollapseLastStep();

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
					debug( 'Contact details are populated; attempting to skip to payment method step' );
					if ( shouldCollapseLastStep ) {
						return setStepCompleteStatus( 'payment-method-step' );
					}
					return setStepCompleteStatus( 'contact-form' );
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
		shouldCollapseLastStep,
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
export default function useCachedDomainContactDetails(
	setShouldShowContactDetailsValidationErrors: ( allowed: boolean ) => void,
	overrideCountryList?: CountryListItem[]
): void {
	const cachedContactDetails = useCachedContactDetails();
	useCachedContactDetailsForCheckoutForm(
		cachedContactDetails,
		setShouldShowContactDetailsValidationErrors,
		overrideCountryList
	);
}
