import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
		return <NoSupport unsupportedFeature={ __( 'custom font selection', 'full-site-editing' ) } />;
	}

	return (
		<>
			<SelectControl
				label={ __( 'Heading Font', 'full-site-editing' ) }
				value={ fontHeadings }
				options={ fontHeadingsOptions }
				onChange={ ( newValue ) => updateHeadingsFont( newValue ) }
				style={ { fontFamily: fontHeadings !== 'unset' ? fontHeadings : fontHeadingsDefault } }
			/>
			<SelectControl
				label={ __( 'Base Font', 'full-site-editing' ) }
				value={ fontBase }
				options={ fontBaseOptions }
				onChange={ ( newValue ) => updateBaseFont( newValue ) }
				style={ { fontFamily: fontBase !== 'unset' ? fontBase : fontBaseDefault } }
			/>
			<hr />
		</>
	);
};
