/** @format */

/**
 * External dependencies
 */
import { PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import JetpackFieldRequiredToggle from './jetpack-field-required-toggle';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const JetpackFieldSettings = props => {
	return (
		<InspectorControls>
			<PanelBody title={ __( 'Field Settings' ) }>
				<JetpackFieldRequiredToggle
					required={ props.required }
					onChange={ required => {
						props.setAttributes( { required } );
					} }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default JetpackFieldSettings;
