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

function renderEmail( inputText ) {
	return textMatchReplace(
		inputText,
		/((?:[a-z|0-9+_](?:\.|_\+)*)+[a-z|0-9]\@(?:[a-z|0-9])+(?:(?:\.){0,1}[a-z|0-9]){2}\.[a-z]{2,22})/gim,
		( email, i ) => (
			<a href={ `mailto:${ email }` } key={ i }>
				{ email }
			</a>
		)
	);
}

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
			className,
			isSelected,
		} = this.props;
		return (
			<div className={ isSelected ? 'jetpack-email-block is-selected' : 'jetpack-email-block' }>
				{ ! isSelected &&
					email !== '' && <div className={ className }>{ renderEmail( email ) }</div> }
				{ ( isSelected || email === '' ) && (
					<PlainText
						value={ email }
						placeholder={ __( 'Email' ) }
						onBlur={ this.onBlur }
						onChange={ this.onChange }
					/>
				) }
			</div>
		);
	}
}

export default EmailEdit;
