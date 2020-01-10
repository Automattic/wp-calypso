/**
 * External dependencies.
 */
import { FontSizePicker } from '@wordpress/block-editor';

export default ( { typeScaleRoot, typeScaleRootDefault, update } ) => {
	return (
		<FontSizePicker
			value={ typeScaleRoot || typeScaleRootDefault }
			onChange={ value =>
				value === undefined ? update( typeScaleRootDefault ) : update( value )
			}
		/>
	);
};
