/**
 * WordPress dependencies
 */
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { OPERATOR_BETWEEN } from '../constants';
import type { DataFormControlProps } from '../types';

function BetweenControls< Item >( {
	id,
	value,
	onChange,
	hideLabelFromVision,
}: {
	id: string;
	value: any;
	onChange: DataFormControlProps< Item >[ 'onChange' ];
	hideLabelFromVision?: boolean;
} ) {
	const [ min = '', max = '' ] = Array.isArray( value ) ? value : [];

	const onChangeMin = useCallback(
		( newValue: string | undefined ) =>
			onChange( {
				[ id ]: [ Number( newValue ), max ],
			} ),
		[ id, onChange, max ]
	);

	const onChangeMax = useCallback(
		( newValue: string | undefined ) =>
			onChange( {
				[ id ]: [ min, Number( newValue ) ],
			} ),
		[ id, onChange, min ]
	);

	return (
		<>
			<NumberControl
				label={ __( 'Min' ) }
				value={ min }
				max={ max ? Number( max ) - 1 : undefined }
				onChange={ onChangeMin }
				__next40pxDefaultSize
				hideLabelFromVision={ hideLabelFromVision }
			/>
			<NumberControl
				label={ __( 'Max' ) }
				value={ max }
				help={ __( 'Max value must be greater than min value' ) }
				min={ min ? Number( min ) + 1 : undefined }
				onChange={ onChangeMax }
				__next40pxDefaultSize
				hideLabelFromVision={ hideLabelFromVision }
			/>
		</>
	);
}

export default function Integer< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	operator,
}: DataFormControlProps< Item > ) {
	const { id, label, description } = field;
	const value = field.getValue( { item: data } ) ?? '';
	const onChangeControl = useCallback(
		( newValue: string | undefined ) =>
			onChange( {
				[ id ]: Number( newValue ),
			} ),
		[ id, onChange ]
	);

	if ( operator === OPERATOR_BETWEEN ) {
		return (
			<BetweenControls
				id={ id }
				value={ value }
				onChange={ onChange }
				hideLabelFromVision={ hideLabelFromVision }
			/>
		);
	}

	return (
		<NumberControl
			label={ label }
			help={ description }
			value={ value }
			onChange={ onChangeControl }
			__next40pxDefaultSize
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
}
