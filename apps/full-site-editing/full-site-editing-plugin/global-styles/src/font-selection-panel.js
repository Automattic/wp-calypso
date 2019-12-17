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
	lineHeightHeadings,
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
				label={ __( 'Heading line height' ) }
				value={ lineHeightBase }
				onChange={ newValue => updateBaseLineHeight( newValue ) }
				allowReset={ true }
				min={ 1.2 }
				max={ 2 }
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
				value={ lineHeightHeadings }
				onChange={ newValue => updateHeadingsLineHeight( newValue ) }
				allowReset={ true }
				min={ 1.2 }
				max={ 2 }
			/>
			<hr />
		</>
	);
};
