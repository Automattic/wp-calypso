/** @format */

/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import save from './save';

class PhoneEdit extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChange = this.onChange.bind( this );
	}

	onChange( newPhone ) {
		this.props.setAttributes( { phone: newPhone } );
	}

	render() {
		const {
			attributes: { phone },
			isSelected,
		} = this.props;

		return (
			<div className={ isSelected ? 'jetpack-phone-block is-selected' : 'jetpack-phone-block' }>
				{ ! isSelected && phone !== '' && save( this.props ) }
				{ ( isSelected || phone === '' ) && (
					<PlainText
						value={ phone }
						placeholder={ __( 'Phone number' ) }
						onChange={ this.onChange }
					/>
				) }
			</div>
		);
	}
}

export default PhoneEdit;
