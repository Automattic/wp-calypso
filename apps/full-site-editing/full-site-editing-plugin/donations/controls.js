/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { ExternalLink, PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';

const Controls = ( props ) => {
	const { attributes, setAttributes, siteSlug } = props;
	const { showMonthly, showAnnual, showCustom } = attributes;
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'full-site-editing' ) }>
				<ToggleControl
					checked={ showMonthly }
					onChange={ ( value ) => setAttributes( { showMonthly: value } ) }
					label={ __( 'Show monthly donations', 'full-site-editing' ) }
				/>
				<ToggleControl
					checked={ showAnnual }
					onChange={ ( value ) => setAttributes( { showAnnual: value } ) }
					label={ __( 'Show annual donations', 'full-site-editing' ) }
				/>
				<ToggleControl
					checked={ showCustom }
					onChange={ ( value ) => setAttributes( { showCustom: value } ) }
					label={ __( 'Show custom amount option', 'full-site-editing' ) }
				/>
				<ExternalLink href={ `https://wordpress.com/earn/payments/${ siteSlug }` }>
					{ __( 'View donation earnings', 'full-site-editing' ) }
				</ExternalLink>
			</PanelBody>
		</InspectorControls>
	);
};

export default Controls;
