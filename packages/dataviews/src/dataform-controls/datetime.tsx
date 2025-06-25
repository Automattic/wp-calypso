/**
 * WordPress dependencies
 */
import {
	BaseControl,
	TimePicker,
	VisuallyHidden,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { DataFormControlProps } from '../types';
import { OPERATOR_IN_THE_PAST, OPERATOR_OVER } from '../constants';

const TIME_UNITS_OPTIONS = {
	[ OPERATOR_IN_THE_PAST ]: [
		{ value: 'days', label: __( 'Days' ) },
		{ value: 'weeks', label: __( 'Weeks' ) },
		{ value: 'months', label: __( 'Months' ) },
		{ value: 'years', label: __( 'Years' ) },
	],
	[ OPERATOR_OVER ]: [
		{ value: 'days', label: __( 'Days ago' ) },
		{ value: 'weeks', label: __( 'Weeks ago' ) },
		{ value: 'months', label: __( 'Months ago' ) },
		{ value: 'years', label: __( 'Years ago' ) },
	],
};

function RelativeDateControls( {
	id,
	value,
	onChange,
	label,
	hideLabelFromVision,
	options,
}: {
	id: string;
	value: { value?: string | number; unit?: string };
	onChange: ( value: any ) => void;
	label: string;
	hideLabelFromVision?: boolean;
	options: { value: string; label: string }[];
} ) {
	const { value: relValue = '', unit = options[ 0 ].value } = value;

	const onChangeValue = useCallback(
		( newValue: string | undefined ) =>
			onChange( {
				[ id ]: { value: Number( newValue ), unit },
			} ),
		[ id, onChange, unit ]
	);

	const onChangeUnit = useCallback(
		( newUnit: string | undefined ) =>
			onChange( {
				[ id ]: { value: relValue, unit: newUnit },
			} ),
		[ id, onChange, relValue ]
	);

	return (
		<BaseControl
			__nextHasNoMarginBottom
			className="dataviews-controls__datetime"
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
		>
			<HStack spacing={ 2.5 }>
				<NumberControl
					__next40pxDefaultSize
					className="dataviews-controls__datetime-number"
					spinControls="none"
					min={ 1 }
					step={ 1 }
					value={ relValue }
					onChange={ onChangeValue }
				/>
				<SelectControl
					className="dataviews-controls__datetime-unit"
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Unit' ) }
					value={ unit }
					options={ options }
					onChange={ onChangeUnit }
					hideLabelFromVision={ true }
				/>
			</HStack>
		</BaseControl>
	);
}

export default function DateTime< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	operator,
}: DataFormControlProps< Item > ) {
	const { id, label } = field;
	const value = field.getValue( { item: data } );

	const onChangeControl = useCallback(
		( newValue: string | null ) => onChange( { [ id ]: newValue } ),
		[ id, onChange ]
	);

	if ( operator === OPERATOR_IN_THE_PAST || operator === OPERATOR_OVER ) {
		return (
			<RelativeDateControls
				id={ id }
				value={ value && typeof value === 'object' ? value : {} }
				onChange={ onChange }
				label={ label }
				hideLabelFromVision={ hideLabelFromVision }
				options={ TIME_UNITS_OPTIONS[ operator ] }
			/>
		);
	}

	return (
		<fieldset className="dataviews-controls__datetime">
			{ ! hideLabelFromVision && (
				<BaseControl.VisualLabel as="legend">
					{ label }
				</BaseControl.VisualLabel>
			) }
			{ hideLabelFromVision && (
				<VisuallyHidden as="legend">{ label }</VisuallyHidden>
			) }
			<TimePicker
				currentTime={ typeof value === 'string' ? value : undefined }
				onChange={ onChangeControl }
				hideLabelFromVision
			/>
		</fieldset>
	);
}
