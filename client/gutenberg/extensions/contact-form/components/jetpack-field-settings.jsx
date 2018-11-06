/** @format */

/**
 * External dependencies
 */
import { PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import JetpackFieldRequiredToggle from './jetpack-field-required-toggle';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class JetpackFieldSettings extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeRequired = this.onChangeRequired.bind( this );
	}

	onChangeRequired( required ) {
		this.props.setAttributes( { required } );
	}

	render() {
		return (
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings' ) }>
					<JetpackFieldRequiredToggle
						required={ this.props.required }
						onChange={ this.onChangeRequired }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}
}

export default JetpackFieldSettings;
