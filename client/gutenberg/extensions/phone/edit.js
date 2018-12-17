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
import textMatchReplace from 'gutenberg/extensions/presets/jetpack/utils/text-match-replace';

function renderPhone( inputText ) {
	return textMatchReplace(
		inputText,
		/([0-9\()+]{1}[\ \-().]?[0-9]{1,6}[\ \-().]?[0-9]{0,6}[\ \-()]?[0-9]{0,6}[\ \-().]?[0-9]{0,6}[\ \-().]?[0-9]{0,6}[\ \-().]?[0-9]{0,6})/g,
		( number, i ) => {
			if ( number.trim() === '' ) {
				return number;
			}

			return (
				<a href={ `tel:${ number.replace( /\D/g, '' ) }` } key={ i }>
					{ number }
				</a>
			);
		}
	);
}

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
			className,
			isSelected,
		} = this.props;

		return (
			<div className={ isSelected ? 'jetpack-phone-block is-selected' : 'jetpack-phone-block' }>
				{ ! isSelected &&
					phone !== '' && <div className={ className }>{ renderPhone( phone ) }</div> }
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
