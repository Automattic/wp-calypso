/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { DataFormControlProps } from '../types';

export default function Boolean< Item >( {
	field,
	onChange,
	data,
	hideLabelFromVision,
}: DataFormControlProps< Item > ) {
	const { id, getValue, label } = field;
	if ( hideLabelFromVision ) {
		return (
			<ToggleControl
				__nextHasNoMarginBottom
				label={ '' }
				checked={ getValue( { item: data } ) }
				onChange={ () =>
					onChange( { [ id ]: ! getValue( { item: data } ) } )
				}
			/>
		);
	}

	return (
		<label>
			{ label }
			<ToggleControl
				__nextHasNoMarginBottom
				label={ '' }
				checked={ getValue( { item: data } ) }
				onChange={ () =>
					onChange( { [ id ]: ! getValue( { item: data } ) } )
				}
			/>
		</label>
	);
}
