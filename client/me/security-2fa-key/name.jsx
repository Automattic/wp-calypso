/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import webauthn from 'lib/webauthn';
import Spinner from 'components/spinner';

const debug = debugFactory( 'calypso:me:security-2fa-key' );

class Security2faKeyAddName extends React.Component {
	static propTypes = {
		onNameSubmit: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	state = {
		error: false,
		keyName: '',
	};

	componentDidMount = () => {
		this.setState( { error: false, keyName: '' } );
	};

	submitName = e => {
		e.preventDefault();
		this.props.onNameSubmit( this.state.keyName );
	};

	handleChange = e => {
        const { name, value } = e.currentTarget;
        this.setState( { keyName: value } );
    };

	render() {
		return (
			<form className="security-2fa-key__add-key-name-form" onSubmit={ this.submitName }>
				<FormFieldset>
					<FormLabel htmlFor="security-2fa-key__key-name">
						{ this.props.translate( 'Give the security key a name' ) }
					</FormLabel>
					<FormTextInput
						className="security-2fa-key__key-name"
						id="security-2fa-key__key_name"
						name="security_key_name"
						placeholder={ this.props.translate( 'ex: myFidokey' ) }
						onChange={ this.handleChange }
						value={ this.state.keyName }
					/>
				</FormFieldset>
				<Button onClick={ this.props.onCancel }>{ this.props.translate( 'Cancel' ) }</Button>
				<FormButton
					className="security-2fa-key__register-key"
					//onClick={ this.submitName }
				>
				{ this.props.translate( 'Register key' ) }
				</FormButton>
			</form>
		);
	};
}

export default localize( Security2faKeyAddName );
