import { countryListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import type { CountryListItem, StoredPaymentMethodTaxLocation } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

function getFields( {
	countryList,
}: {
	countryList: CountryListItem[];
} ): Field< StoredPaymentMethodTaxLocation >[] {
	return [
		{
			id: 'country_code',
			label: __( 'Country' ),
			Edit: 'select',
			elements: countryList
				.filter( ( countryItem ) => countryItem.name )
				.map( ( countryItem ) => ( {
					label: countryItem.name,
					value: countryItem.code,
				} ) ),
		},
		{
			id: 'postal_code',
			label: __( 'Postal code' ),
			Edit: 'text',
		},
		{
			id: 'subdivision_code',
			label: __( 'State/Province' ),
			Edit: 'text',
		},
		{
			id: 'city',
			label: __( 'City' ),
			Edit: 'text',
		},
		{
			id: 'organization',
			label: __( 'Organization' ),
			Edit: 'text',
		},
		{
			id: 'address',
			label: __( 'Address' ),
			Edit: 'text',
		},
	];
}

export function calculateTaxLocationFields( {
	selectedCountryItem,
}: {
	selectedCountryItem?: CountryListItem;
} ): string[] {
	const fields = [ 'country_code' ];
	if ( selectedCountryItem?.has_postal_codes ) {
		fields.push( 'postal_code' );
	}
	if ( selectedCountryItem?.tax_needs_subdivision ) {
		fields.push( 'subdivision_code' );
	}
	if ( selectedCountryItem?.tax_needs_city ) {
		fields.push( 'city' );
	}
	if ( selectedCountryItem?.tax_needs_organization ) {
		fields.push( 'organization' );
	}
	if ( selectedCountryItem?.tax_needs_address ) {
		fields.push( 'address' );
	}
	// FIXME: add is_for_business if elligible (two US states)
	return fields;
}

export const defaultTaxLocation: StoredPaymentMethodTaxLocation = {
	country_code: '',
	postal_code: '',
	subdivision_code: '',
	ip_address: '',
	vat_id: '',
	organization: '',
	address: '',
	city: '',
};

export function TaxLocationForm( {
	data,
	onChange,
}: {
	data: StoredPaymentMethodTaxLocation;
	onChange: ( updated: Partial< StoredPaymentMethodTaxLocation > ) => void;
} ) {
	const { data: countryList } = useQuery( countryListQuery() );

	const selectedCountryCode = data?.country_code;
	const selectedCountryItem = useMemo( () => {
		if ( ! countryList || ! selectedCountryCode ) {
			return undefined;
		}
		return countryList.find(
			( country ) =>
				country.code.toUpperCase() === selectedCountryCode?.toUpperCase() ||
				( country.vat_supported &&
					selectedCountryCode &&
					country.tax_country_codes.includes( selectedCountryCode.toUpperCase() ) )
		);
	}, [ countryList, selectedCountryCode ] );

	const form = useMemo(
		() => ( {
			type: 'regular' as const,
			labelPosition: 'top' as const,
			fields: calculateTaxLocationFields( { selectedCountryItem } ),
		} ),
		[ selectedCountryItem ]
	);

	if ( ! countryList ) {
		return null;
	}

	return (
		<DataForm< StoredPaymentMethodTaxLocation >
			data={ data }
			fields={ getFields( { countryList } ) }
			form={ form }
			onChange={ onChange }
		/>
	);
}
