/**
 * WordPress dependencies
 */
import { CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { DataFormControlPropsWithConstraints } from '../components/validation';

export default function Checkbox< Item >( {
	field,
	onChange,
	data,
	hideLabelFromVision,
	constraints,
}: DataFormControlPropsWithConstraints< Item > ) {
	const { id, getValue, label, description } = field;

	const required = constraints?.required ?? false;

	return (
		<CheckboxControl
			__nextHasNoMarginBottom
			label={ ! hideLabelFromVision ? label : '' }
			help={ description }
			checked={ getValue( { item: data } ) }
			onChange={ () =>
				onChange( { [ id ]: ! getValue( { item: data } ) } )
			}
			required={ required }
		/>
	);
}
