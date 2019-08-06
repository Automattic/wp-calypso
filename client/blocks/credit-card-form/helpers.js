/**
 * External dependencies
 */
import { useState, useEffect, useRef } from 'react';
import { camelCase, kebabCase, debounce } from 'lodash';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { handleRenewNowClick, isRenewable } from 'lib/purchases';
import wpcomFactory from 'lib/wp';

const wpcom = wpcomFactory.undocumented();

export async function saveCreditCard( {
	createCardToken,
	saveStoredCard,
	translate,
	successCallback,
	apiParams,
	purchase,
	siteSlug,
	formFieldValues,
} ) {
	const cardDetails = kebabCaseFormFields( formFieldValues );
	const { token } = await createCardTokenAsync( { cardDetails, createCardToken } );

	if ( saveStoredCard ) {
		await saveStoredCard( { token } );
		notices.success( translate( 'Card added successfully' ), {
			persistent: true,
		} );
		successCallback();
		return;
	}

	const updatedCreditCardApiParams = getParamsForApi( cardDetails, token, apiParams );
	const response = wpcom.updateCreditCard( updatedCreditCardApiParams );
	if ( response.error ) {
		throw new Error( response );
	}

	if ( purchase && siteSlug && isRenewable( purchase ) ) {
		const noticeMessage = translate(
			'Your credit card details were successfully updated, but your subscription has not been renewed yet.'
		);
		const noticeOptions = {
			button: translate( 'Renew Now' ),
			onClick: function( event, closeFunction ) {
				handleRenewNowClick( purchase, siteSlug );
				closeFunction();
			},
			persistent: true,
		};
		notices.info( noticeMessage, noticeOptions );
		successCallback();
		return;
	}
	notices.success( response.success, {
		persistent: true,
	} );
	successCallback();
}

export function getParamsForApi( cardDetails, cardToken, extraParams = {} ) {
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
		cardToken,
	};
}

export function useDebounce( value, delay ) {
	const [ debouncedValue, setDebouncedValue ] = useState( value );
	const debounced = useRef( debounce( newValue => setDebouncedValue( newValue ), delay ) );
	useEffect( () => debounced.current( value ), [ value ] );
	return [ debouncedValue, setDebouncedValue ];
}

function createCardTokenAsync( { cardDetails, createCardToken } ) {
	return new Promise( ( resolve, reject ) => {
		createCardToken( cardDetails, ( gatewayError, gatewayData ) => {
			if ( gatewayError || ! gatewayData.token ) {
				reject( gatewayError || new Error( 'No card token returned' ) );
				return;
			}
			resolve( gatewayData );
		} );
	} );
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
