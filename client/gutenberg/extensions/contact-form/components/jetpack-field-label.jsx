/** @format */

/**
 * External dependencies
 */

import { Component, Fragment } from '@wordpress/element';


class JetpackFieldLabel extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeLabel = this.onChangeLabel.bind( this );
	}

	onChangeLabel( event ) {
		this.props.setAttributes( { label: event.target.value } );
	}
/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

	render() {
		return (
			<Fragment>
				<input
					type="text"
					value={ this.props.label }
					className="jetpack-field-label"
					onChange={ this.onChangeLabel }
				/>
						placeholder={ __( 'Type label…' ) }
				{ props.required && <span className="required">{ __( '(required)' ) }</span> }
			</Fragment>
		);
	}
}

export default JetpackFieldLabel;
