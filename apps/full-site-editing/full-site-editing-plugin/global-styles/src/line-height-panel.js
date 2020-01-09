/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies.
 */
import { RangeControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import NoSupport from './no-support';

export default ( {
	lineHeightBase,
	lineHeightBaseDefault,
	lineHeightHeadings,
	lineHeightHeadingsDefault,
	updateBaseLineHeight,
	updateHeadingsLineHeight,
} ) => {
	if ( ! lineHeightBaseDefault || ! lineHeightHeadingsDefault ) {
		return <NoSupport unsupportedFeature={ __( 'line height selection' ) } />;
	}

	return (
		<>
			<RangeControl
				label={ __( 'Headings line height' ) }
				value={ lineHeightHeadings }
				onChange={ newValue =>
					newValue
						? updateHeadingsLineHeight( newValue )
						: updateHeadingsLineHeight( lineHeightHeadingsDefault )
				}
				min={ 0 }
				max={ 3 }
				step={ 0.01 }
				initialPosition={ lineHeightHeadingsDefault }
				allowReset
			/>
			<RangeControl
				label={ __( 'Base line height' ) }
				value={ lineHeightBase }
				onChange={ newValue =>
					newValue
						? updateBaseLineHeight( newValue )
						: updateBaseLineHeight( lineHeightBaseDefault )
				}
				min={ 0 }
				max={ 3 }
				step={ 0.01 }
				initialPosition={ lineHeightBaseDefault }
				allowReset
			/>
		</>
	);
};
