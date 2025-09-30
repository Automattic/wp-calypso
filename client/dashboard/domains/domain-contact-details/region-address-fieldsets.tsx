import { type StatesListItem, type DomainContactDetails } from '@automattic/api-core';
import { __experimentalInputControl as InputControl, SelectControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { type Field, type DataFormControlProps } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './custom-form-fieldsets/constants';

const POST_CODE_LABEL: Record< string, string > = {
	US: __( 'ZIP code' ),
};

const STATE_SELECT_TEXT: Record< string, string > = {
	CA: __( 'Select Province' ),
	US: __( 'Select State' ),
};

const createStateFieldEdit = ( statesList: StatesListItem[] | undefined, countryCode: string ) => {
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

		const stateLabel = STATE_SELECT_TEXT[ countryCode ] || __( 'Select State' );

		if ( ! statesList || statesList.length === 0 ) {
			return (
				<InputControl
					__next40pxDefaultSize
					label={ hideLabelFromVision ? '' : stateLabel }
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
				label={ hideLabelFromVision ? '' : stateLabel }
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

export function RegionAddressFieldsets(
	statesList: StatesListItem[] | undefined,
	countryCode: string
): Field< DomainContactDetails >[] {
	const StateFieldEdit = createStateFieldEdit( statesList, countryCode );
	const arePostalCodesSupported = true; //getCountryPostalCodeSupport( statesList, countryCode );

	const fields: Field< DomainContactDetails >[] = [
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
			type: 'text',
			getValue: ( { item }: { item: DomainContactDetails } ) => item.state ?? '',
			Edit: StateFieldEdit,
		},
	];

	if ( arePostalCodesSupported ) {
		const postalCodeLabel = POST_CODE_LABEL[ countryCode ] || __( 'Postal Code' );
		fields.push( {
			id: 'postalCode',
			label: postalCodeLabel,
			type: 'text',
			isValid: {
				required: true,
			},
		} );
	}

	return fields;
}

export function RegionAddressFieldsLayout( {
	statesList,
	countryCode,
}: {
	statesList: StatesListItem[] | undefined;
	countryCode: string;
} ) {
	const hasCountryStates = countryCode ? !! statesList?.length : false;
	const isMobileViewport = useViewportMatch( 'small', '<' );

	if ( ! hasCountryStates ) {
		if ( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) ) {
			return [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row' as const,
						alignment: 'start' as const,
					},
					children: [ 'postalCode', 'city' ],
				} as Field< DomainContactDetails >,
			];
		}

		if ( CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES.includes( countryCode ) ) {
			return [
				'address1',
				'address2',
				{
					id: 'location-row',
					layout: {
						type: 'row' as const,
						alignment: 'start' as const,
					},
					children: [ 'city', 'postalCode' ],
				} as Field< DomainContactDetails >,
			];
		}
	}

	return [
		'address1',
		'address2',
		{
			id: 'location-row',
			layout: {
				type: 'row' as const,
				alignment: 'start' as const,
			},
			children: isMobileViewport ? [ 'city', 'state' ] : [ 'city', 'state', 'postalCode' ],
		} as Field< DomainContactDetails >,
		...( isMobileViewport ? [ 'postalCode' ] : [] ),
	];
}
