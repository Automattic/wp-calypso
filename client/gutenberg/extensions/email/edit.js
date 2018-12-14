/** @format */

/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import HelpMessage from 'gutenberg/extensions/presets/jetpack/editor-shared/help-message';

class EmailEdit extends Component {
	constructor( ...args ) {
		super( ...args );

		this.onBlur = this.onBlur.bind( this );
		this.onChange = this.onChange.bind( this );

		this.state = {
			hasError: ! emailValidator.validate( this.props.attributes.email ),
		};
	}

	onBlur( event ) {
		const isValid = emailValidator.validate( event.target.value );
		this.setState( { hasError: ! isValid } );
	}

	onChange( newEmail ) {
		this.props.setAttributes( { email: newEmail } );
		this.setState( { hasError: false } );
	}

	render() {
		const {
			attributes: { email },
			className,
			isSelected,
		} = this.props;
		return (
			<div className={ isSelected ? 'jetpack-email-block is-selected' : 'jetpack-email-block' }>
				{ ! isSelected && (
					<div className={ className }>
						<a href={ `mailto:${ email }` }>{ email }</a>
					</div>
				) }
				{ isSelected && (
					<PlainText
						value={ email }
						placeholder={ __( 'Email' ) }
						onBlur={ this.onBlur }
						onChange={ this.onChange }
					/>
				) }
				{ this.state.hasError &&
					email !== '' && (
						<HelpMessage isError>
							{ sprintf( __( '%s is not a valid email.' ), email ) }
						</HelpMessage>
					) }
			</div>
		);
	}
}

export default EmailEdit;
