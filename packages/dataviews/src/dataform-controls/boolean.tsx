/**
 * WordPress dependencies
 */
import { BaseControl, ToggleControl } from '@wordpress/components';

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
			<BaseControl>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ '' }
					checked={ getValue( { item: data } ) }
					onChange={ () =>
						onChange( { [ id ]: ! getValue( { item: data } ) } )
					}
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
			/>
		</BaseControl>
	);
}
