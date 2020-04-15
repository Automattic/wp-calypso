/**
 * External dependencies
 */
import { useState, useEffect, useRef } from 'react';
import { camelCase, kebabCase, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import notices from 'notices';
import {
	handleRenewNowClick,
	isRenewable,
	shouldAddPaymentSourceInsteadOfRenewingNow,
} from 'lib/purchases';
import wpcomFactory from 'lib/wp';

const wpcom = wpcomFactory.undocumented();

export async function saveOrUpdateCreditCard( {
	createCardToken,
	saveStoredCard,
	translate,
	apiParams,
	purchase,
	siteSlug,
	formFieldValues,
	stripeConfiguration,
	parseTokenFromResponse,
} ) {
	const token = await getTokenForSavingCard( {
		formFieldValues,
		createCardToken,
		parseTokenFromResponse,
		translate,
	} );

	if ( saveStoredCard ) {
		return saveCreditCard( {
			token,
			translate,
			saveStoredCard,
			stripeConfiguration,
		} );
	}

	return updateCreditCard( {
		formFieldValues,
		apiParams,
		purchase,
		siteSlug,
		token,
		translate,
		stripeConfiguration,
	} );
}

async function getTokenForSavingCard( {
	formFieldValues,
	createCardToken,
	parseTokenFromResponse,
	translate,
} ) {
	const cardDetails = kebabCaseFormFields( formFieldValues );
	const tokenResponse = await createCardToken( cardDetails );
	const token = parseTokenFromResponse( tokenResponse );
	if ( ! token ) {
		throw new Error( translate( 'Failed to add card.' ) );
	}
	return token;
}

async function saveCreditCard( { token, translate, saveStoredCard, stripeConfiguration } ) {
	const additionalData = stripeConfiguration
		? { payment_partner: stripeConfiguration.processor_id }
		: {};
	await saveStoredCard( { token, additionalData } );
	notices.success( translate( 'Card added successfully' ), {
		persistent: true,
	} );
}

async function updateCreditCard( {
	formFieldValues,
	apiParams,
	purchase,
	siteSlug,
	token,
	translate,
	stripeConfiguration,
} ) {
	const cardDetails = kebabCaseFormFields( formFieldValues );
	const updatedCreditCardApiParams = getParamsForApi(
		cardDetails,
		token,
		stripeConfiguration,
		apiParams
	);
	const response = await wpcom.updateCreditCard( updatedCreditCardApiParams );
	if ( response.error ) {
		throw new Error( response );
	}

	if ( purchase && siteSlug && isRenewable( purchase ) ) {
		let noticeMessage = '';
		let noticeOptions = {};
		if ( shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) ) {
			noticeMessage = translate( 'Your credit card details were successfully updated.' );
			noticeOptions = {
				persistent: true,
			};
		} else {
			noticeMessage = translate(
				'Your credit card details were successfully updated, but your subscription has not been renewed yet.'
			);
			noticeOptions = {
				button: translate( 'Renew Now' ),
				onClick: function ( event, closeFunction ) {
					handleRenewNowClick( purchase, siteSlug );
					closeFunction();
				},
				persistent: true,
			};
		}
		notices.info( noticeMessage, noticeOptions );
		return;
	}
	notices.success( response.success, {
		persistent: true,
	} );
}

export function getParamsForApi( cardDetails, cardToken, stripeConfiguration, extraParams = {} ) {
	return {
		...extraParams,
		country: cardDetails.country,
		zip: cardDetails[ 'postal-code' ],
		month: cardDetails[ 'expiration-date' ].split( '/' )[ 0 ],
		year: cardDetails[ 'expiration-date' ].split( '/' )[ 1 ],
		name: cardDetails.name,
		document: cardDetails.document,
		street_number: cardDetails[ 'street-number' ],
		address_1: cardDetails[ 'address-1' ],
		address_2: cardDetails[ 'address-2' ],
		city: cardDetails.city,
		state: cardDetails.state,
		phone_number: cardDetails[ 'phone-number' ],
		payment_partner: stripeConfiguration ? stripeConfiguration.processor_id : '',
		paygate_token: cardToken,
	};
}

export function useDebounce( value, delay ) {
	const [ debouncedValue, setDebouncedValue ] = useState( value );
	const debounced = useRef( debounce( ( newValue ) => setDebouncedValue( newValue ), delay ) );
	useEffect( () => debounced.current( value ), [ value ] );
	return [ debouncedValue, setDebouncedValue ];
}

export function makeAsyncCreateCardToken( createCardToken ) {
	return ( cardDetails ) => {
		return new Promise( ( resolve, reject ) => {
			createCardToken( cardDetails, ( gatewayError, gatewayData ) => {
				if ( gatewayError || ! gatewayData.token ) {
					reject( gatewayError || new Error( 'No card token returned' ) );
					return;
				}
				resolve( gatewayData );
			} );
		} );
	};
}

export function areFormFieldsEmpty( formFieldValues ) {
	return Object.keys( formFieldValues ).reduce( ( isEmpty, key ) => {
		return formFieldValues[ key ].length ? false : isEmpty;
	}, true );
}

export function kebabCaseFormFields( formFieldValues ) {
	return Object.keys( formFieldValues ).reduce( ( fields, key ) => {
		fields[ kebabCase( key ) ] = formFieldValues[ key ];
		return fields;
	}, {} );
}

export function camelCaseFormFields( formFieldValues ) {
	return Object.keys( formFieldValues ).reduce( ( fields, key ) => {
		fields[ camelCase( key ) ] = formFieldValues[ key ];
		return fields;
	}, {} );
}

export function assignAllFormFields( formFieldValues, value ) {
	return Object.keys( formFieldValues ).reduce( ( fields, key ) => {
		fields[ key ] = value;
		return fields;
	}, {} );
}

export function getInitializedFields( initialValues = {} ) {
	const fieldNames = [
		'name',
		'number',
		'cvv',
		'expirationDate',
		'country',
		'postalCode',
		'streetNumber',
		'address1',
		'address2',
		'phoneNumber',
		'streetNumber',
		'city',
		'state',
		'document',
		'brand',
	];
	return fieldNames.reduce( ( finalFields, fieldName ) => {
		return { ...finalFields, ...{ [ fieldName ]: initialValues[ fieldName ] || '' } };
	}, {} );
}
