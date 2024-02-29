import config from '@automattic/calypso-config';
import { useSetStepComplete } from '@automattic/composite-checkout';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
	CountryListItem,
	DomainContactValidationRequest,
	ManagedContactDetailsTldExtraFieldsShape,
	PossiblyCompleteDomainContactDetails,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:use-cached-domain-contact-details' );

export type ContactDetailsSnakeCase< T = string | null > = {
	address_1?: T;
	address_2?: T;
	city?: T;
	country_code?: T;
	email?: T;
	extra?: ContactDetailsSnakeCaseExtra< T >;
	fax?: T;
	first_name?: T;
	last_name?: T;
	organization?: T;
	phone?: T;
	phone_number_country?: T;
	postal_code?: T;
	state?: T;
	vat_id?: T;
};

export type ContactDetailsSnakeCaseExtra< T = string | null > = {
	ca?: {
		lang?: T;
		legal_type?: T;
		cira_agreement_accepted?: boolean;
	};
	fr?: {
		registrant_type?: T;
		registrant_vat_id?: T;
		trademark_number?: T;
		siren_siret?: T;
	};
	uk?: {
		registrant_type?: T;
		registration_number?: T;
		trading_name?: T;
	};
};

async function fetchCachedContactDetails(): Promise< PossiblyCompleteDomainContactDetails > {
	const rawData: ContactDetailsSnakeCase = await wpcom.req.get( '/me/domain-contact-information' );
	return convertSnakeCaseContactDetailsToCamelCase( rawData );
}

async function setCachedContactDetails( rawData: DomainContactValidationRequest ): Promise< void > {
	wpcom.req.post( '/me/domain-contact-information', rawData );
}

function convertSnakeCaseContactDetailsToCamelCase(
	rawData: ContactDetailsSnakeCase
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
		extra: convertSnakeCaseContactDetailsExtraToCamelCase( rawData.extra ),
	};
}

function convertSnakeCaseContactDetailsExtraToCamelCase(
	extra: ContactDetailsSnakeCaseExtra | undefined
): ManagedContactDetailsTldExtraFieldsShape< string | null > | undefined {
	if ( ! extra ) {
		return undefined;
	}
	return {
		ca: {
			lang: extra.ca?.lang,
			legalType: extra.ca?.legal_type,
			ciraAgreementAccepted: extra.ca?.cira_agreement_accepted
				? String( extra.ca.cira_agreement_accepted )
				: undefined,
		},
		uk: {
			registrantType: extra.uk?.registrant_type,
			registrationNumber: extra.uk?.registration_number,
			tradingName: extra.uk?.trading_name,
		},
		fr: {
			registrantType: extra.fr?.registrant_type,
			trademarkNumber: extra.fr?.trademark_number,
			sirenSiret: extra.fr?.siren_siret,
		},
	};
}

const cachedContactDetailsQueryKey = [ 'user-cached-contact-details' ];

export function useCachedContactDetails( {
	isLoggedOut,
}: {
	isLoggedOut?: boolean;
} ): PossiblyCompleteDomainContactDetails | null {
	const result = useQuery( {
		queryKey: cachedContactDetailsQueryKey,
		queryFn: fetchCachedContactDetails,
		enabled: ! isLoggedOut,
	} );
	return result.data ?? null;
}

export function useUpdateCachedContactDetails(): (
	updatedData: DomainContactValidationRequest
) => void {
	const queryClient = useQueryClient();
	const mutation = useMutation< void, Error, DomainContactValidationRequest >( {
		mutationFn: setCachedContactDetails,
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: cachedContactDetailsQueryKey,
			} );
		},
	} );
	return mutation.mutate;
}

function useCachedContactDetailsForCheckoutForm(
	cachedContactDetails: PossiblyCompleteDomainContactDetails | null,
	setShouldShowContactDetailsValidationErrors?: ( allowed: boolean ) => void,
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
			postalCode: arePostalCodesSupported ? cachedContactDetails.postalCode ?? null : '',
		} )
			.then( () => {
				if ( ! isMounted.current ) {
					return false;
				}
				if ( cachedContactDetails.countryCode ) {
					setShouldShowContactDetailsValidationErrors?.( false );
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
				setShouldShowContactDetailsValidationErrors?.( true );
				setComplete( true );
			} )
			.catch( ( error: Error ) => {
				setShouldShowContactDetailsValidationErrors?.( true );
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
	setShouldShowContactDetailsValidationErrors?: ( allowed: boolean ) => void;
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
