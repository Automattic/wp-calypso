import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	SelectControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// import {
// 	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
// 	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
// } from './custom-form-fieldsets/constants';
// import EuAddressFieldset from './custom-form-fieldsets/eu-address-fieldset';
// import UkAddressFieldset from './custom-form-fieldsets/uk-address-fieldset';
// import UsAddressFieldset from './custom-form-fieldsets/us-address-fieldset';
import type { FieldProps } from '../managed-contact-details-form-fields';
import type { StatesListItem, DomainContactDetails } from '@automattic/api-core';

const createStateFieldEdit = ( statesList: StatesListItem[] | undefined ) => {
	const StateFieldEdit = ( {
		field,
		onChange,
		data,
		hideLabelFromVision,
	}: DataFormControlProps< DomainContactDetails > ) => {
		const { id, getValue } = field;
		const currentValue = getValue?.( { item: data } );

		// If the item data is not in the statesList, set the state to the first option
		useEffect( () => {
			if ( statesList && statesList.length > 0 ) {
				if ( ! statesList.some( ( state ) => state.code === currentValue ) ) {
					onChange( { [ id ]: statesList[ 0 ]?.code } );
				}
			}
		}, [ currentValue, onChange, id ] );

		if ( ! statesList || statesList.length === 0 ) {
			return (
				<InputControl
					__next40pxDefaultSize
					label={ hideLabelFromVision ? '' : __( 'State' ) }
					placeholder={ __( 'State' ) }
					value={ currentValue }
					onChange={ ( value ) => onChange( { [ id ]: value } ) }
				/>
			);
		}

		return (
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : __( 'State' ) }
				value={ currentValue }
				options={
					statesList.map( ( state ) => ( {
						label: state.name,
						value: state.code,
					} ) ) ?? []
				}
				onChange={ ( value ) => onChange( { [ id ]: value } ) }
			/>
		);
	};

	return StateFieldEdit;
};

export interface RegionAddressFieldsetsProps {
	countryCode: string;
	shouldAutoFocusAddressField?: boolean;
	arePostalCodesSupported?: boolean;
	hasCountryStates?: boolean;
	contactDetailsErrors: Record< string, string | undefined >;
	getFieldProps: (
		name: string,
		options: {
			customErrorMessage?: string;
			needsChildRef?: boolean;
		}
	) => FieldProps;
}

export default function getRegionAddressFieldsets( statesList: StatesListItem[] | undefined ) {
	const StateFieldEdit = createStateFieldEdit( statesList );

	// const getRegionAddressFieldset = () => {
	// 	if ( ! hasCountryStates ) {
	// 		if ( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) ) {
	// 			return (
	// 				<EuAddressFieldset
	// 					countryCode={ countryCode }
	// 					arePostalCodesSupported={ arePostalCodesSupported }
	// 					contactDetailsErrors={ contactDetailsErrors }
	// 					getFieldProps={ getFieldProps }
	// 				/>
	// 			);
	// 		}

	// 		if ( CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) ) {
	// 			return (
	// 				<UkAddressFieldset
	// 					countryCode={ countryCode }
	// 					arePostalCodesSupported={ arePostalCodesSupported }
	// 					contactDetailsErrors={ contactDetailsErrors }
	// 					getFieldProps={ getFieldProps }
	// 				/>
	// 			);
	// 		}
	// 	}

	// 	return (
	// 		<UsAddressFieldset
	// 			countryCode={ countryCode }
	// 			arePostalCodesSupported={ arePostalCodesSupported }
	// 			contactDetailsErrors={ contactDetailsErrors }
	// 			getFieldProps={ getFieldProps }
	// 		/>
	// 	);
	// };

	const customFormFieldsets = [
		{
			id: 'city',
			label: __( 'City' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'state',
			label: __( 'State' ),
			type: 'text',
			getValue: ( { item }: { item: DomainContactDetails } ) => item.state ?? '',
			Edit: StateFieldEdit,
		},
		{
			id: 'postalCode',
			label: __( 'Post code' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
	];

	return [
		{
			id: 'address1',
			label: __( 'Address' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'address2',
			label: __( 'Address line 2' ),
			type: 'text',
		},
		...customFormFieldsets,
	];
}
