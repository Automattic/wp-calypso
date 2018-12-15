/** @format */

/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import HelpMessage from 'gutenberg/extensions/presets/jetpack/editor-shared/help-message';

const validatePhone = inputtxt => {
	return inputtxt !== '' ? /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test( inputtxt ) : true;
};

class PhoneEdit extends Component {
	constructor( ...args ) {
		super( ...args );

		this.onBlur = this.onBlur.bind( this );
		this.onChange = this.onChange.bind( this );

		this.state = {
			hasError: ! validatePhone( this.props.attributes.phone ),
		};
	}

	onBlur( event ) {
		const isValid = validatePhone( event.target.value );
		this.setState( { hasError: ! isValid } );
	}

	onChange( newPhone ) {
		this.props.setAttributes( { phone: newPhone } );
		this.setState( { hasError: false } );
	}

	render() {
		const {
			attributes: { phone },
			className,
			isSelected,
		} = this.props;
		return (
			<div className={ isSelected ? 'jetpack-phone-block is-selected' : 'jetpack-phone-block' }>
				{ ! isSelected &&
					phone !== '' && (
						<div className={ className }>
							<a href={ `tel:${ phone }` }>{ phone }</a>
						</div>
					) }
				{ ( isSelected || phone === '' ) && (
					<PlainText
						value={ phone }
						placeholder={ __( 'Phone number' ) }
						onBlur={ this.onBlur }
						onChange={ this.onChange }
					/>
				) }
				{ this.state.hasError && (
					<HelpMessage isError>
						{ sprintf( __( '%s is not a valid phone number.' ), phone ) }
					</HelpMessage>
				) }
			</div>
		);
	}
}

export default PhoneEdit;
