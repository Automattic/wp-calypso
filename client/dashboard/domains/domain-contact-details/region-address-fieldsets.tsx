import { type StatesListItem, type DomainContactDetails } from '@automattic/api-core';
import { __experimentalInputControl as InputControl, SelectControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { type Field, type DataFormControlProps } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './custom-form-fieldsets/constants';
import { getCountryPostalCodeSupport } from './custom-form-fieldsets/get-country-postal-code-support';
import { type CountryListItem } from './custom-form-fieldsets/types';

const getPostalCodeLabel = ( countryCode: string ): string => {
	switch ( countryCode ) {
		case 'US':
			return __( 'ZIP code' );
		default:
			return __( 'Postal Code' );
	}
};

const getStateSelectLabel = (
	countryCode: string,
	statesList: StatesListItem[] | undefined
): string => {
	switch ( countryCode ) {
		case 'CA':
			return __( 'Select Province' );
		default:
			if ( statesList && statesList.length > 0 ) {
				return __( 'Select State' );
			}
			return __( 'State' );
	}
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

		const stateLabel = getStateSelectLabel( countryCode, statesList );

		if ( ! statesList || statesList.length === 0 ) {
			return (
				<InputControl
					__next40pxDefaultSize
					label={ hideLabelFromVision ? '' : stateLabel }
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
		{
			id: 'postalCode',
			label: getPostalCodeLabel( countryCode ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
	];

	return fields;
}

export function RegionAddressFieldsLayout( {
	statesList,
	countryList,
	countryCode,
}: {
	statesList: StatesListItem[] | undefined;
	countryList: CountryListItem[] | undefined;
	countryCode: string;
} ) {
	const hasCountryStates = countryCode ? !! statesList?.length : false;
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const arePostalCodesSupported = getCountryPostalCodeSupport( countryList ?? [], countryCode );

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
					children: [ ...( arePostalCodesSupported ? [ 'postalCode' ] : [] ), 'city' ],
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
					children: [ 'city', ...( arePostalCodesSupported ? [ 'postalCode' ] : [] ) ],
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
			children: isMobileViewport
				? [ 'city', 'state' ]
				: [ 'city', 'state', ...( arePostalCodesSupported ? [ 'postalCode' ] : [] ) ],
		} as Field< DomainContactDetails >,
		...( isMobileViewport && arePostalCodesSupported ? [ 'postalCode' ] : [] ),
	];
}
