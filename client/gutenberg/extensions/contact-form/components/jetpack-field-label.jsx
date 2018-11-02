/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */

import { Component, Fragment } from '@wordpress/element';

import { __ } from '@wordpress/i18n';

class JetpackFieldLabel extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeLabel = this.onChangeLabel.bind( this );
	}

	onChangeLabel( event ) {
		this.props.setAttributes( { label: event.target.value } );
	}

	render() {
		return (
			<Fragment>
				<input
					type="text"
					value={ this.props.label }
					className="jetpack-field-label"
					onChange={ this.onChangeLabel }
					placeholder={ __( 'Type here…', 'jetpack' ) }
				/>
				{ this.props.required && <span className="required">{ __( '(required)', 'jetpack' ) }</span> }
			</Fragment>
		);
	}
}

export default JetpackFieldLabel;
