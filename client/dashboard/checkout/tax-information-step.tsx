import {
	validateTaxContactInformation,
	type ValidateTaxContactInfoParams,
	type TaxValidationResponse,
	StoredPaymentMethodTaxLocation,
} from '@automattic/api-core';
import { useIsStepActive } from '@automattic/composite-checkout';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { Card, CardBody } from '../components/card';
import { TaxLocationForm, defaultTaxLocation } from '../components/tax-location-form';
import type { TaxLocationUpdate } from '@automattic/shopping-cart';

/**
 * Tax Information Step Title - changes based on active state
 */
export function TaxInformationStepTitle() {
	const isActive = useIsStepActive();
	return <>{ isActive ? __( 'Enter your billing address' ) : __( 'Billing address' ) }</>;
}

/**
 * Tax Information Step Content - shows the tax location form
 */
export function TaxInformationStepContent( {
	taxLocation,
	onTaxLocationChange,
}: {
	taxLocation: StoredPaymentMethodTaxLocation;
	onTaxLocationChange: ( updated: Partial< StoredPaymentMethodTaxLocation > ) => void;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<TaxLocationForm data={ taxLocation } onChange={ onTaxLocationChange } />
				</VStack>
			</CardBody>
		</Card>
	);
}

/**
 * Tax Information Summary - shown when step is complete
 */
export function TaxInformationSummary( {
	taxLocation,
}: {
	taxLocation: StoredPaymentMethodTaxLocation;
} ) {
	const parts = [];
	if ( taxLocation.city ) {
		parts.push( taxLocation.city );
	}
	if ( taxLocation.subdivision_code ) {
		parts.push( taxLocation.subdivision_code );
	}
	if ( taxLocation.postal_code ) {
		parts.push( taxLocation.postal_code );
	}
	if ( taxLocation.country_code ) {
		parts.push( taxLocation.country_code );
	}

	return <div>{ parts.join( ', ' ) }</div>;
}

/**
 * Converts StoredPaymentMethodTaxLocation to TaxLocationUpdate for cart API
 */
function convertTaxLocationToCartUpdate(
	taxLocation: StoredPaymentMethodTaxLocation
): TaxLocationUpdate {
	return {
		countryCode: taxLocation.country_code,
		postalCode: taxLocation.postal_code,
		subdivisionCode: taxLocation.subdivision_code,
		vatId: taxLocation.vat_id,
		organization: taxLocation.organization,
		address: taxLocation.address,
		city: taxLocation.city,
	};
}

/**
 * Converts StoredPaymentMethodTaxLocation to ValidateTaxContactInfoParams for validation API
 */
function convertTaxLocationToValidationParams(
	taxLocation: StoredPaymentMethodTaxLocation
): ValidateTaxContactInfoParams {
	return {
		contact_information: {
			country_code: taxLocation.country_code,
			postal_code: taxLocation.postal_code,
			address_1: taxLocation.address,
			city: taxLocation.city,
			state: taxLocation.subdivision_code,
			organization: taxLocation.organization,
		},
	};
}

/**
 * Validates and updates the cart's tax location
 */
export async function validateAndUpdateCartLocation(
	taxLocation: StoredPaymentMethodTaxLocation,
	updateLocation: ( location: TaxLocationUpdate ) => Promise< unknown >,
	onValidationError?: ( response: TaxValidationResponse ) => void
): Promise< boolean > {
	// Validate the contact information with the server
	try {
		const validationParams = convertTaxLocationToValidationParams( taxLocation );
		const validationResponse = await validateTaxContactInformation( validationParams );

		// If validation fails, show error messages and don't proceed
		if ( ! validationResponse.success ) {
			onValidationError?.( validationResponse );
			return false;
		}
	} catch ( error ) {
		// If validation API call fails, we should not continue
		return false;
	}

	// If validation passes, update the cart's tax location on the server
	try {
		const cartLocationData = convertTaxLocationToCartUpdate( taxLocation );
		await updateLocation( cartLocationData );
		return true;
	} catch ( error ) {
		// If updating the cart fails, we should not continue.
		// The cart error messages will display the error to the user.
		return false;
	}
}

/**
 * Hook to manage tax location state for checkout
 */
export function useTaxLocationState( initialValue?: StoredPaymentMethodTaxLocation ) {
	const [ taxLocation, setTaxLocation ] = useState< StoredPaymentMethodTaxLocation >(
		initialValue || defaultTaxLocation
	);

	const handleTaxLocationChange = useCallback(
		( updated: Partial< StoredPaymentMethodTaxLocation > ) => {
			setTaxLocation( ( current ) => ( { ...current, ...updated } ) );
		},
		[]
	);

	return {
		taxLocation,
		setTaxLocation,
		handleTaxLocationChange,
	};
}
