/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies.
 */
import { SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import NoSupport from './no-support';

export default ( {
	fontBase,
	fontBaseDefault,
	fontHeadings,
	fontHeadingsDefault,
	fontBaseOptions,
	fontHeadingsOptions,
	updateBaseFont,
	updateHeadingsFont,
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
				onChange={ ( newValue ) => updateHeadingsFont( newValue ) }
				style={ { fontFamily: fontHeadings !== 'unset' ? fontHeadings : fontHeadingsDefault } }
			/>
			<SelectControl
				label={ __( 'Base Font' ) }
				value={ fontBase }
				options={ fontBaseOptions }
				onChange={ ( newValue ) => updateBaseFont( newValue ) }
				style={ { fontFamily: fontBase !== 'unset' ? fontBase : fontBaseDefault } }
			/>
			<hr />
		</>
	);
};
