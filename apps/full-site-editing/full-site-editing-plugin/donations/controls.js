/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { ExternalLink, PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';

const Controls = ( props ) => {
	const { attributes, setAttributes, products, siteSlug } = props;
	const { monthlyPlanId, annuallyPlanId, showCustomAmount } = attributes;
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Settings', 'full-site-editing' ) }>
				<ToggleControl
					checked={ !! monthlyPlanId }
					onChange={ ( value ) =>
						setAttributes( { monthlyPlanId: value ? products[ '1 month' ] : null } )
					}
					label={ __( 'Show monthly donations', 'full-site-editing' ) }
				/>
				<ToggleControl
					checked={ !! annuallyPlanId }
					onChange={ ( value ) =>
						setAttributes( { annuallyPlanId: value ? products[ '1 year' ] : null } )
					}
					label={ __( 'Show annual donations', 'full-site-editing' ) }
				/>
				<ToggleControl
					checked={ showCustomAmount }
					onChange={ ( value ) => setAttributes( { showCustomAmount: value } ) }
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
