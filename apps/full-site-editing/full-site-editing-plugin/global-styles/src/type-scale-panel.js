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
	typeScaleRootUnits,
	updateTypeScaleRatio,
	updateTypeScaleRoot,
} ) => {
	const getInitialValue = ( valueWithUnits, units, defaultWithUnits ) => {
		if ( typeof valueWithUnits === 'string' || valueWithUnits instanceof String ) {
			return +valueWithUnits.replace( new RegExp( units ), '' );
		}
		if ( typeof defaultWithUnits === 'string' || defaultWithUnits instanceof String ) {
			return +defaultWithUnits.replace( new RegExp( units ), '' );
		}
		return null;
	};
	return (
		<>
			<FontSizePicker
				value={ getInitialValue( typeScaleRoot, typeScaleRootUnits, typeScaleRootDefault ) }
				onChange={ value =>
					value
						? updateTypeScaleRoot( value + typeScaleRootUnits )
						: updateTypeScaleRoot( typeScaleRootDefault )
				}
			/>
			<RangeControl
				label={ __( 'Type Scale Ratio' ) }
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
