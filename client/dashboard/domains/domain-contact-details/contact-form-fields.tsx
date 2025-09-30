import {
	CheckboxControl,
	SelectControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { type DataFormControlProps, Field } from '@wordpress/dataviews';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
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

export const getContactFormFields = (
	countryList: Array< { name: string; code: string } > | undefined,
	statesList: Array< { name: string; code: string } > | undefined
): Field< DomainContactDetails >[] => {
	const StateFieldEdit = createStateFieldEdit( statesList );

	return [
		{
			id: 'firstName',
			label: __( 'First name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'lastName',
			label: __( 'Last name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'organization',
			label: __( 'Organization' ),
			type: 'text',
		},
		{
			id: 'email',
			label: __( 'Email' ),
			type: 'email',
			isValid: {
				required: true,
			},
		},
		{
			id: 'phone',
			label: __( 'Phone' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'countryCode',
			label: __( 'Country' ),
			type: 'text',
			elements:
				countryList?.map( ( country ) => ( {
					label: country.name,
					value: country.code,
				} ) ) ?? [],
			isValid: {
				required: true,
			},
		},
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
		{
			id: 'optOutTransferLock',
			label: __( 'Opt-out of the 60-day transfer lock' ),
			type: 'boolean',
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				return (
					<HStack spacing={ 0 } alignment="start" justify="flex-start">
						<CheckboxControl
							label=""
							checked={ getValue( { item: data } ) }
							onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
						/>
						{ ! hideLabelFromVision && (
							<Text>
								{ createInterpolateElement(
									sprintf(
										/* translators: %s: "what is this?" link */
										__( 'Opt-out of the 60-day transfer lock <link>%s</link>' ),
										__( 'what is this?' )
									),
									{
										link: <InlineSupportLink supportContext="60-day-transfer-lock" />,
									}
								) }
							</Text>
						) }
					</HStack>
				);
			},
		},
	];
};
