/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DataFormControlPropsWithConstraints } from '../components/validation';

export default function Text< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	...props
}: DataFormControlPropsWithConstraints< Item > ) {
	const { id, label, placeholder, description } = field;
	const value = field.getValue( { item: data } );

	const onChangeControl = useCallback(
		( newValue: string ) =>
			onChange( {
				[ id ]: newValue,
			} ),
		[ id, onChange ]
	);

	const constraints = props.constraints;

	return (
		<TextControl
			label={ label }
			placeholder={ placeholder }
			value={ value ?? '' }
			help={ description }
			onChange={ onChangeControl }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			hideLabelFromVision={ hideLabelFromVision }
			required={ constraints?.required ?? false }
		/>
	);
}
