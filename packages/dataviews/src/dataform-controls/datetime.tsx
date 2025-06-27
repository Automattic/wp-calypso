/**
 * WordPress dependencies
 */
import { BaseControl, TimePicker, VisuallyHidden } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { DataFormControlProps } from '../types';
import RelativeDateControl from './relative-date-control';
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
			<RelativeDateControl
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
