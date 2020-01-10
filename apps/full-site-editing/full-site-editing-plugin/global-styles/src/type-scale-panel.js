/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { FontSizePicker } from '@wordpress/block-editor';
import { RangeControl } from '@wordpress/components';

export default ( {
	typeScaleRatio,
	typeScaleRatioDefault,
	typeScaleRoot,
	typeScaleRootDefault,
	updateTypeScaleRatio,
	updateTypeScaleRoot,
} ) => {
	return (
		<>
			<FontSizePicker
				value={ typeScaleRoot || typeScaleRootDefault }
				onChange={ value =>
					value ? updateTypeScaleRoot( value ) : updateTypeScaleRoot( typeScaleRootDefault )
				}
			/>
			<RangeControl
				label={ __( 'Typescale Ratio' ) }
				value={ typeScaleRatio || typeScaleRatioDefault }
				onChange={ value =>
					value ? updateTypeScaleRatio( value ) : updateTypeScaleRatio( typeScaleRatioDefault )
				}
				min={ 0 }
				max={ 3 }
				step={ 0.01 }
				initialPosition={ typeScaleRatioDefault }
				allowReset
			/>
		</>
	);
};
