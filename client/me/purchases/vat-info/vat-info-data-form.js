import { DataForm } from '@automattic/dataviews';
import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import useDataFormCountryCodes from './use-data-form-country-codes';
import useVatDetails from './use-vat-details';

function VatIdField( { data, field, onChange } ) {
	const { id, label } = field;
	const value = field.getValue( { item: data } );

	const onChangeControl = useCallback(
		( newValue ) =>
			onChange( {
				[ id ]: newValue,
			} ),
		[ id, onChange ]
	);

	const prefix = useMemo( () => {
		return data.country ? (
			<InputControlPrefixWrapper>{ data.country }</InputControlPrefixWrapper>
		) : null;
	}, [ data.country ] );

	return (
		<InputControl
			__next40pxDefaultSize
			label={ label }
			onChange={ onChangeControl }
			prefix={ prefix }
			value={ value ?? '' }
		/>
	);
}

export default function VatInfoDataForm() {
	const translate = useTranslate();
	const { vatDetails } = useVatDetails();
	const countryCodes = useDataFormCountryCodes();

	const [ localData, setLocalData ] = useState( undefined );

	const data = useMemo( () => {
		const serverData = {
			country: vatDetails.country ?? '',
			id: vatDetails.id ?? '',
			name: vatDetails.name ?? '',
			address: vatDetails.address ?? '',
		};
		return {
			...serverData,
			...localData,
		};
	}, [ localData, vatDetails.address, vatDetails.country, vatDetails.id, vatDetails.name ] );
	const fields = [
		{
			elements: countryCodes,
			id: 'country',
			label: translate( 'Country' ),
			type: 'text',
		},
		{
			Edit: VatIdField,
			id: 'id',
			label: translate( 'VAT ID' ),
		},
		{
			id: 'name',
			label: translate( 'Name' ),
			type: 'text',
		},
		{
			id: 'address',
			label: translate( 'Address' ),
			type: 'text',
		},
	];
	const form = {
		type: 'regular',
		fields: [ 'country', 'id', 'name', 'address' ],
	};
	const onChange = ( edits ) => {
		setLocalData( ( current ) => ( { ...current, ...edits } ) );
	};

	return (
		<form onSubmit={ () => {} }>
			<DataForm data={ data } fields={ fields } form={ form } onChange={ onChange } />
		</form>
	);
}
