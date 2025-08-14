import {
	CheckboxControl,
	SelectControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import type { DomainContactDetails } from './types';

export const StateFieldEdit = ( {
	field,
	onChange,
	data,
	hideLabelFromVision,
	statesList,
}: {
	field: { id: string; getValue: ( { item }: { item: DomainContactDetails } ) => string };
	onChange: ( value: Partial< DomainContactDetails > ) => void;
	data: DomainContactDetails;
	hideLabelFromVision?: boolean;
	statesList?: Array< { name: string; code: string } >;
} ) => {
	const { id, getValue } = field;

	if ( ! statesList || statesList?.length === 0 ) {
		return (
			<InputControl
				__next40pxDefaultSize
				label={ hideLabelFromVision ? '' : __( 'State' ) }
				placeholder={ __( 'State' ) }
				value={ getValue( { item: data } ) }
				onChange={ ( value ) => onChange( { [ id ]: value } ) }
			/>
		);
	}

	// If the item data is not in the statesList, set the state to the first option
	if ( ! statesList?.some( ( state ) => state.code === getValue( { item: data } ) ) ) {
		onChange( { [ id ]: statesList[ 0 ]?.code } );
	}

	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ hideLabelFromVision ? '' : __( 'State' ) }
			value={ getValue( { item: data } ) }
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

export const getContactFormFields = (
	formattedCountryList: Array< { label: string; value: string } > | undefined,
	statesList: Array< { name: string; code: string } > | undefined,
	StateFieldEditComponent: React.ComponentType< any >
): Field< DomainContactDetails >[] => [
	{
		id: 'firstName',
		label: __( 'First Name' ),
		type: 'text',
		isValid: {
			required: true,
		},
	},
	{
		id: 'lastName',
		label: __( 'Last Name' ),
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
		type: 'select',
		elements: formattedCountryList,
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
		label: __( 'Address Line 2' ),
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
		Edit: ( props ) => <StateFieldEditComponent { ...props } statesList={ statesList } />,
	},
	{
		id: 'postalCode',
		label: __( 'Post Code' ),
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
				<CheckboxControl
					label={
						hideLabelFromVision
							? ''
							: createInterpolateElement(
									sprintf(
										/* translators: %s: "what is this?" link */
										__( 'Opt-out of the 60-day transfer lock <link>%s</link>' ),
										__( 'what is this?' )
									),
									{
										link: <InlineSupportLink supportContext="60-day-transfer-lock" />,
									}
							  )
					}
					checked={ getValue( { item: data } ) }
					onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
				/>
			);
		},
	},
];
