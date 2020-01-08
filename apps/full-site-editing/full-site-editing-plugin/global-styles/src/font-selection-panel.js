/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies.
 */
import { RangeControl, SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import NoSupport from './no-support';

export default ( {
	fontBase,
	fontBaseDefault,
	fontBaseOptions,
	fontHeadings,
	fontHeadingsDefault,
	fontHeadingsOptions,
	updateBaseFont,
	updateHeadingsFont,
	lineHeightBase,
	lineHeightBaseDefault,
	lineHeightHeadings,
	lineHeightHeadingsDefault,
	updateBaseLineHeight,
	updateHeadingsLineHeight,
} ) => {
	if ( ! fontBaseOptions || ! fontHeadingsOptions ) {
		return <NoSupport unsupportedFeature={ __( 'custom font selection' ) } />;
	}

	return (
		<>
			<SelectControl
				label={ __( 'Heading Font' ) }
				value={ fontHeadings }
				options={ fontHeadingsOptions }
				onChange={ newValue => updateHeadingsFont( newValue ) }
				style={ { fontFamily: fontHeadings !== 'unset' ? fontHeadings : fontHeadingsDefault } }
			/>
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
			<SelectControl
				label={ __( 'Base Font' ) }
				value={ fontBase }
				options={ fontBaseOptions }
				onChange={ newValue => updateBaseFont( newValue ) }
				style={ { fontFamily: fontBase !== 'unset' ? fontBase : fontBaseDefault } }
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
			<hr />
		</>
	);
};
