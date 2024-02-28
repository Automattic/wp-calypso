import config from '@automattic/calypso-config';
import { useSetStepComplete } from '@automattic/composite-checkout';
import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch as useWordPressDataDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { ComponentType, useEffect, useRef, useState } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { convertErrorToString } from '../lib/analytics';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import useCountryList from './use-country-list';
import type { CountryListItem } from '@automattic/wpcom-checkout';

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

export type ContactDetailsCamelCase< T = string | null > = {
	address1?: T;
	address2?: T;
	city?: T;
	countryCode?: T;
	email?: T;
	extra?: ContactDetailsCamelCaseExtra< T >;
	fax?: T;
	firstName?: T;
	lastName?: T;
	organization?: T;
	phone?: T;
	phoneNumberCountry?: T;
	postalCode?: T;
	state?: T;
	vatId?: T;
};

export type ContactDetailsCamelCaseExtra< T = string | null > = {
	ca?: {
		lang?: T;
		legalType?: T;
		ciraAgreementAccepted?: boolean;
	};
	fr?: {
		registrantType?: T;
		registrantVatId?: T;
		trademarkNumber?: T;
		sirenSiret?: T;
	};
	uk?: {
		registrantType?: T;
		registrationNumber?: T;
		tradingName?: T;
	};
};

async function fetchCachedContactDetails(): Promise< ContactDetailsCamelCase > {
	const rawData: ContactDetailsSnakeCase = await wpcom.req.get( '/me/domain-contact-information' );
	return convertSnakeCaseContactDetailsToCamelCase( rawData );
}

async function setCachedContactDetails( rawData: ContactDetailsSnakeCase ): Promise< void > {
	wpcom.req.post( '/me/domain-contact-information', { contact_information: rawData } );
}

function convertSnakeCaseContactDetailsToCamelCase(
	rawData: ContactDetailsSnakeCase
): ContactDetailsCamelCase {
	return {
		firstName: rawData.first_name,
		lastName: rawData.last_name,
		organization: rawData.organization,
		email: rawData.email,
		phone: rawData.phone,
		address1: rawData.address_1,
		address2: rawData.address_2,
		city: rawData.city,
		state: rawData.state,
		postalCode: rawData.postal_code,
		countryCode: rawData.country_code,
		fax: rawData.fax,
		extra: convertSnakeCaseContactDetailsExtraToCamelCase( rawData.extra ),
	};
}

function convertSnakeCaseContactDetailsExtraToCamelCase(
	extra: ContactDetailsSnakeCaseExtra | undefined
): ContactDetailsCamelCaseExtra | undefined {
	if ( ! extra ) {
		return undefined;
	}
	return {
		ca: {
			lang: extra.ca?.lang,
			legalType: extra.ca?.legal_type,
			ciraAgreementAccepted: extra.ca?.cira_agreement_accepted
				? extra.ca.cira_agreement_accepted
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

function convertCamelCaseContactDetailsToSnakeCase(
	details: ContactDetailsCamelCase
): ContactDetailsSnakeCase {
	const extra: ContactDetailsSnakeCaseExtra = {};

	if ( details.extra?.ca ) {
		extra.ca = {
			lang: details.extra.ca.lang ?? undefined,
			legal_type: details.extra.ca.legalType ?? undefined,
			cira_agreement_accepted: details.extra.ca.ciraAgreementAccepted,
		};
	}
	if ( details.extra?.uk ) {
		extra.uk = {
			registrant_type: details.extra.uk.registrantType ?? undefined,
			registration_number: details.extra.uk.registrationNumber ?? undefined,
			trading_name: details.extra.uk.tradingName ?? undefined,
		};
	}
	if ( details.extra?.fr ) {
		extra.fr = {
			registrant_type: details.extra.fr.registrantType ?? undefined,
			registrant_vat_id: details.extra.fr.registrantVatId ?? undefined,
			trademark_number: details.extra.fr.trademarkNumber ?? undefined,
			siren_siret: details.extra.fr.sirenSiret ?? undefined,
		};
	}

	return {
		address_1: details.address1 ?? undefined,
		address_2: details.address2 ?? undefined,
		city: details.city ?? undefined,
		country_code: details.countryCode ?? undefined,
		email: details.email ?? undefined,
		fax: details.fax ?? undefined,
		first_name: details.firstName ?? undefined,
		last_name: details.lastName ?? undefined,
		organization: details.organization ?? undefined,
		phone: details.phone ?? undefined,
		phone_number_country: details.phone ?? undefined,
		postal_code: details.postalCode ?? undefined,
		state: details.state ?? undefined,
		extra,
	};
}

const cachedContactDetailsQueryKey = [ 'user-cached-contact-details' ];

export function useCachedContactDetails( {
	isLoggedOut,
}: {
	isLoggedOut?: boolean;
} ): ContactDetailsCamelCase | null {
	const result = useQuery( {
		queryKey: cachedContactDetailsQueryKey,
		queryFn: fetchCachedContactDetails,
		enabled: ! isLoggedOut,
	} );
	return result.data ?? null;
}

export function useUpdateCachedContactDetails(): ( updatedData: ContactDetailsCamelCase ) => void {
	const queryClient = useQueryClient();

	const mutation = useMutation< void, Error, ContactDetailsSnakeCase >( {
		mutationFn: setCachedContactDetails,
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: cachedContactDetailsQueryKey,
			} );
		},
	} );

	return ( updatedData: ContactDetailsCamelCase ) => {
		mutation.mutate( convertCamelCaseContactDetailsToSnakeCase( updatedData ) );
	};
}

function useCachedContactDetailsForCheckoutForm(
	cachedContactDetails: ContactDetailsCamelCase | null,
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
			address1: cachedContactDetails.address1 ?? null,
			address2: cachedContactDetails.address2 ?? null,
			city: cachedContactDetails.city ?? null,
			countryCode: cachedContactDetails.countryCode ?? null,
			email: cachedContactDetails.email ?? null,
			extra: cachedContactDetails.extra,
			fax: cachedContactDetails.fax ?? null,
			firstName: cachedContactDetails.firstName ?? null,
			lastName: cachedContactDetails.lastName ?? null,
			organization: cachedContactDetails.organization ?? null,
			phone: cachedContactDetails.phone ?? null,
			state: cachedContactDetails.state ?? null,
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

export interface WithCachedDomainContactDetailsProps {
	cachedContactDetails: ReturnType< typeof useCachedContactDetails >;
}

export function withCachedContactDetails< P >( Component: ComponentType< P > ) {
	return function CachedDomainContactDetailsWrapper(
		props: Omit< P, keyof WithCachedDomainContactDetailsProps >
	) {
		const cachedContactDetails = useCachedContactDetails( {} );
		return <Component { ...( props as P ) } cachedContactDetails={ cachedContactDetails } />;
	};
}

export interface WithUpdateCachedDomainContactDetailsProps {
	updateCachedContactDetails: ReturnType< typeof useUpdateCachedContactDetails >;
}

export function withUpdateCachedContactDetails< P >( Component: ComponentType< P > ) {
	return function CachedDomainContactDetailsWrapper(
		props: Omit< P, keyof WithUpdateCachedDomainContactDetailsProps >
	) {
		const updateCachedContactDetails = useUpdateCachedContactDetails();
		return (
			<Component { ...( props as P ) } updateCachedContactDetails={ updateCachedContactDetails } />
		);
	};
}
