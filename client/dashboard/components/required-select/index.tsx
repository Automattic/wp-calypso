import { SelectControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import type { DataFormControlProps } from '@automattic/dataviews';

// A verbatim copy of @automattic/dataviews/src/dataform-controls/select.tsx,
// but without the first placeholder option.
export default function RequiredSelect< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
}: DataFormControlProps< Item > ) {
	const { id, label } = field;
	const value = field.getValue( { item: data } ) ?? '';
	const onChangeControl = useCallback(
		( newValue: any ) =>
			onChange( {
				[ id ]: newValue,
			} ),
		[ id, onChange ]
	);

	return (
		<SelectControl
			label={ label }
			value={ value }
			help={ field.description }
			options={ field.elements }
			onChange={ onChangeControl }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			hideLabelFromVision={ hideLabelFromVision }
		/>
	);
}
