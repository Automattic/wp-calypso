/**
 * WordPress dependencies
 */
import { CheckboxControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { DataFormControlProps } from '../types';

export default function Checkbox< Item >( {
	field,
	onChange,
	data,
	hideLabelFromVision,
}: DataFormControlProps< Item > ) {
	const { id, getValue, label, description } = field;

	return (
		<CheckboxControl
			__nextHasNoMarginBottom
			label={ ! hideLabelFromVision ? label : '' }
			help={ description }
			checked={ getValue( { item: data } ) }
			onChange={ () =>
				onChange( { [ id ]: ! getValue( { item: data } ) } )
			}
		/>
	);
}
