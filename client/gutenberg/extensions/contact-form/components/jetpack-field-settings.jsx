/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */
import { PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import JetpackFieldRequiredToggle from './jetpack-field-required-toggle';

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
				<PanelBody title={ __( 'Field Settings', 'jetpack' ) }>
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
