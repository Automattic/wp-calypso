import { countryListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import RequiredSelect from '../../components/required-select';
import { Text } from '../../components/text';
import { PaymentMethodDetails } from './payment-method-details';
import type { CountryListItem, StoredPaymentMethod } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

function getFields( {
	countryList,
}: {
	countryList: CountryListItem[];
} ): Field< StoredPaymentMethod[ 'tax_location' ] >[] {
	return [
		{
			id: 'country_code',
			label: __( 'Country' ),
			Edit: RequiredSelect,
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

const form = {
	type: 'regular' as const,
	labelPosition: 'top' as const,
	fields: [ 'country_code' ],
};

function calculateTaxLocationFields( {
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

export function PaymentMethodEditDialog( {
	paymentMethod,
	isVisible,
	onCancel,
	onConfirm,
}: {
	paymentMethod: StoredPaymentMethod;
	isVisible: boolean;
	onCancel: () => void;
	onConfirm: ( paymentMethod: StoredPaymentMethod ) => void;
} ) {
	const { data: countryList } = useQuery( countryListQuery() );
	const [ formData, setFormData ] = useState< StoredPaymentMethod[ 'tax_location' ] >(
		paymentMethod.tax_location
	);

	const selectedCountryCode = formData?.country_code;
	const selectedCountryItem = countryList?.find(
		( country ) =>
			country.code.toUpperCase() === selectedCountryCode?.toUpperCase() ||
			( country.vat_supported &&
				selectedCountryCode &&
				country.tax_country_codes.includes( selectedCountryCode.toUpperCase() ) )
	);

	form.fields = calculateTaxLocationFields( { selectedCountryItem } );

	return (
		<ConfirmDialog
			isVisible={ isVisible }
			confirmButtonText={ __( 'Save' ) }
			size="large"
			onConfirm={ () =>
				onConfirm( {
					...paymentMethod,
					tax_location: formData,
				} )
			}
			onCancel={ onCancel }
		>
			<VStack style={ { gap: '24px' } }>
				<Heading level={ 2 } size={ 20 } weight={ 500 }>
					{ __( 'Edit billing address' ) }
				</Heading>
				<Text>{ __( 'Set the billing address for the following payment method.' ) }</Text>
				<HStack justify="flex-start">
					<VStack>
						<Text weight={ 500 }>{ paymentMethod.name }</Text>
						<PaymentMethodDetails paymentMethod={ paymentMethod } />
					</VStack>
				</HStack>

				{ countryList && (
					<DataForm< StoredPaymentMethod[ 'tax_location' ] >
						data={ formData }
						fields={ getFields( { countryList } ) }
						form={ form }
						onChange={ ( updated ) => {
							setFormData( ( previous ) => ( { ...previous, ...updated } ) );
						} }
					/>
				) }
			</VStack>
		</ConfirmDialog>
	);
}
