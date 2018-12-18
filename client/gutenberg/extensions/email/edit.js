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

class EmailEdit extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChange = this.onChange.bind( this );
	}

	onChange( newEmail ) {
		this.props.setAttributes( { email: newEmail } );
	}

	render() {
		const {
			attributes: { email },
			isSelected,
		} = this.props;

		return (
			<div className={ isSelected ? 'jetpack-email-block is-selected' : 'jetpack-email-block' }>
				{ ! isSelected && email !== '' && save( this.props ) }
				{ ( isSelected || email === '' ) && (
					<PlainText value={ email } placeholder={ __( 'Email' ) } onChange={ this.onChange } />
				) }
			</div>
		);
	}
}

export default EmailEdit;
