/**
 * WordPress dependencies
 */
import { RadioControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DataFormControlPropsWithConstraints } from '../components/validation';

export default function Radio< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	constraints,
}: DataFormControlPropsWithConstraints< Item > ) {
	const { id, label } = field;
	const value = field.getValue( { item: data } );

	const onChangeControl = useCallback(
		( newValue: string ) =>
			onChange( {
				[ id ]: newValue,
			} ),
		[ id, onChange ]
	);

	const required = constraints?.required ?? false;

	if ( field.elements ) {
		return (
			<RadioControl
				label={ label }
				onChange={ onChangeControl }
				options={ field.elements }
				selected={ value }
				hideLabelFromVision={ hideLabelFromVision }
				required={ required }
			/>
		);
	}

	return null;
}
