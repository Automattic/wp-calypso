/**
 * WordPress dependencies
 */
import { BaseControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { DataFormControlPropsWithConstraints } from '../components/validation';

export default function Boolean< Item >( {
	field,
	onChange,
	data,
	hideLabelFromVision,
	constraints,
}: DataFormControlPropsWithConstraints< Item > ) {
	const { id, getValue, label } = field;

	const required = constraints?.required ?? false;
	if ( hideLabelFromVision ) {
		return (
			<BaseControl>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ '' }
					checked={ getValue( { item: data } ) }
					onChange={ () =>
						onChange( { [ id ]: ! getValue( { item: data } ) } )
					}
					required={ required }
				/>
			</BaseControl>
		);
	}

	return (
		<BaseControl label={ label }>
			<ToggleControl
				__nextHasNoMarginBottom
				label={ '' }
				checked={ getValue( { item: data } ) }
				onChange={ () =>
					onChange( { [ id ]: ! getValue( { item: data } ) } )
				}
				required={ required }
			/>
		</BaseControl>
	);
}
