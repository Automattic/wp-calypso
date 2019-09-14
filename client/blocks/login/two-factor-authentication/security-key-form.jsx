/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import { localize } from 'i18n-calypso';
import { getTwoFactorAuthRequestError } from 'state/login/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { formUpdate, loginUserWithHardwareKey, sendSmsCode } from 'state/login/actions';
import TwoFactorActions from './two-factor-actions';

/**
 * Style dependencies
 */
import './verification-code-form.scss';

class SecurityKeyForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		loginUserWithHardwareKey: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		sendSmsCode: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		twoFactorAuthRequestError: PropTypes.object,
		twoFactorAuthType: PropTypes.string.isRequired,
	};

	state = {
		twoStepCode: '',
		isDisabled: true,
	};

	componentDidMount() {
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { isDisabled: false }, () => {} );
	}

	componentWillReceiveProps = nextProps => {
		// Resets the verification code input field when switching pages
		if ( this.props.twoFactorAuthType !== nextProps.twoFactorAuthType ) {
			this.setState( { twoStepCode: '' } );
		}
	};

	onChangeField = event => {
		const { name, value = '' } = event.target;

		this.props.formUpdate();

		this.setState( { [ name ]: value } );
	};

	onSubmitForm = event => {
		event.preventDefault();

		const { onSuccess, twoFactorAuthType } = this.props;
		const { twoStepCode } = this.state;

		this.props
			.loginUserWithHardwareKey()
			.then( () => onSuccess() )
			.catch( error => {
				this.setState( { isDisabled: false } );

				this.props.recordTracksEvent( 'calypso_login_two_factor_verification_code_failure', {
					error_code: error.code,
					error_message: error.message,
				} );
			} );
	};

	saveRef = input => {
		this.input = input;
	};

	render() {
		const { translate, twoFactorAuthRequestError: requestError, twoFactorAuthType } = this.props;

		let smallPrint;

		return (
			<form onSubmit={ this.onSubmitForm }>
				<Card compact className="two-factor-authentication__verification-code-form">
					<p>
						{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
							components: {
								strong: <strong />,
							},
						} ) }
					</p>
					<p>
						{ translate(
							'Insert your security key into your USB port. Then tap the button or gold disc.'
						) }
					</p>

					<FormButton primary disabled={ this.state.isDisabled }>
						{ translate( 'Continue' ) }
					</FormButton>

					{ smallPrint }
				</Card>

				<TwoFactorActions twoFactorAuthType={ twoFactorAuthType } />
			</form>
		);
	}
}

export default connect(
	state => ( {
		twoFactorAuthRequestError: getTwoFactorAuthRequestError( state ),
	} ),
	{
		formUpdate,
		loginUserWithHardwareKey,
		recordTracksEvent,
		sendSmsCode,
	}
)( localize( SecurityKeyForm ) );
