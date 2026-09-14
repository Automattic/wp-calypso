import { countryListQuery, statesListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { CheckboxWithSupportLink } from './checkbox-with-support-link';
import type {
	CountryListItem,
	StatesListItem,
	StoredPaymentMethodTaxLocation,
} from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

function getFields( {
	countryList,
	statesList,
}: {
	countryList: CountryListItem[];
	statesList: StatesListItem[] | undefined;
} ): Field< StoredPaymentMethodTaxLocation >[] {
	return [
		{
			id: 'country_code',
			label: __( 'Country' ),
			Edit: 'select',
			elements: [
				{ label: __( 'Select Country' ), value: '' },
				...countryList
					.filter( ( countryItem ) => countryItem.name )
					.map( ( countryItem ) => ( {
						label: countryItem.name,
						value: countryItem.code,
					} ) ),
			],
		},
		{
			id: 'postal_code',
			label: __( 'Postal code' ),
			Edit: 'text',
		},
		{
			id: 'subdivision_code',
			label: __( 'State/Province' ),
			Edit: statesList && statesList.length > 0 ? 'select' : 'text',
			elements:
				statesList && statesList.length > 0
					? statesList.map( ( state ) => ( {
							label: state.name,
							value: state.code,
					  } ) )
					: undefined,
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
		{
			id: 'is_for_business',
			label: __( 'Is this purchase for business?' ),
			type: 'boolean' as const,
			Edit: ( { field, data, onChange, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				return (
					<CheckboxWithSupportLink
						label={ __( 'Is this purchase for business? <link>Learn more.</link>' ) }
						supportContext="business-tax-rates-in-ohio-and-connecticut"
						checked={ Boolean( getValue( { item: data } ) ) }
						onChange={ ( newValue ) => onChange( { [ id ]: newValue } ) }
						hideLabelFromVision={ hideLabelFromVision }
					/>
				);
			},
		},
	];
}

/**
 * Ohio and Connecticut charge a reduced sales tax rate on business purchases, so
 * buyers there are asked to declare whether the purchase is for business use.
 * Connecticut's range skips 06390 (Fishers Island), which belongs to New York.
 */
export function isBusinessUseTaxLocation( taxLocation: StoredPaymentMethodTaxLocation ): boolean {
	if ( taxLocation.country_code?.toUpperCase() !== 'US' ) {
		return false;
	}
	const postalCode = parseInt( taxLocation.postal_code ?? '', 10 );
	return (
		( postalCode >= 43000 && postalCode <= 45999 ) ||
		( postalCode >= 6000 && postalCode <= 6389 ) ||
		( postalCode >= 6391 && postalCode <= 6999 )
	);
}

export function calculateTaxLocationFields( {
	selectedCountryItem,
	taxLocation,
	allowIsForBusinessCheckbox,
}: {
	selectedCountryItem?: CountryListItem;
	taxLocation?: StoredPaymentMethodTaxLocation;
	allowIsForBusinessCheckbox?: boolean;
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
	if ( allowIsForBusinessCheckbox && taxLocation && isBusinessUseTaxLocation( taxLocation ) ) {
		fields.push( 'is_for_business' );
	}
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
	allowIsForBusinessCheckbox,
}: {
	data: StoredPaymentMethodTaxLocation;
	onChange: ( updated: Partial< StoredPaymentMethodTaxLocation > ) => void;
	allowIsForBusinessCheckbox?: boolean;
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

	// Query states list for the selected country
	const { data: statesList } = useQuery( {
		...statesListQuery( selectedCountryCode?.toLowerCase() || '' ),
		enabled: !! selectedCountryCode,
	} );

	const form = useMemo(
		() => ( {
			type: 'regular' as const,
			labelPosition: 'top' as const,
			fields: calculateTaxLocationFields( {
				selectedCountryItem,
				taxLocation: data,
				allowIsForBusinessCheckbox,
			} ),
		} ),
		[ selectedCountryItem, data, allowIsForBusinessCheckbox ]
	);

	const fields = useMemo(
		() => getFields( { countryList: countryList || [], statesList } ),
		[ countryList, statesList ]
	);

	if ( ! countryList ) {
		return null;
	}

	const handleChange = ( updated: Partial< StoredPaymentMethodTaxLocation > ) => {
		// The checkbox is hidden once the location stops being eligible, so drop
		// the declaration too rather than submitting one the buyer can't see.
		if ( data.is_for_business && ! isBusinessUseTaxLocation( { ...data, ...updated } ) ) {
			onChange( { ...updated, is_for_business: undefined } );
			return;
		}
		onChange( updated );
	};

	return (
		<DataForm< StoredPaymentMethodTaxLocation >
			data={ data }
			fields={ fields }
			form={ form }
			onChange={ handleChange }
		/>
	);
}
