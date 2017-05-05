/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormsButton from 'components/forms/form-button';
import Card from 'components/card';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import FormCheckbox from 'components/forms/form-checkbox';
import { loginUser } from 'state/login/actions';
import Notice from 'components/notice';
import { recordTracksEvent } from 'state/analytics/actions';
import { isRequesting, getRequestError } from 'state/login/selectors';

export class LoginForm extends Component {
	static propTypes = {
		isRequesting: PropTypes.bool.isRequired,
		loginError: PropTypes.string,
		loginUser: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		requestError: PropTypes.object,
		title: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		title: '',
	};

	state = {
		usernameOrEmail: '',
		password: '',
		rememberMe: false,
	};

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	};

	onChangeRememberMe = ( event ) => {
		const { name, checked } = event.target;

		this.props.recordTracksEvent( 'calypso_login_block_remember_me_change', { new_value: checked } );

		this.setState( { [ name ]: checked } );
	};

	onSubmitForm = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_block_login_submit' );

		this.props.loginUser( this.state.usernameOrEmail, this.state.password, this.state.rememberMe ).then( () => {
			this.props.recordTracksEvent( 'calypso_login_block_login_success' );
			this.props.onSuccess( this.state );
		} ).catch( errorMessage => {
			this.props.recordTracksEvent( 'calypso_login_block_login_failure', {
				error_message: errorMessage
			} );
		} );
	};

	renderNotices() {
		if ( this.props.requestError ) {
			return (
				<Notice status="is-error"
					text={ this.props.requestError.message }
				/>
			);
		}
	}

	render() {
		const isDisabled = {};
		if ( this.props.isRequesting ) {
			isDisabled.disabled = true;
		}

		return (
			<div>
				{ this.renderNotices() }

				<div className="login__form-header">
					{ this.props.title }
				</div>

				<form onSubmit={ this.onSubmitForm }>
					<Card className="login__form">
						<div className="login__form-userdata">
							<label htmlFor="usernameOrEmail" className="login__form-userdata-username">
								{ this.props.translate( 'Username or Email Address' ) }
							</label>

							<FormTextInput
								className="login__form-userdata-username-input"
								onChange={ this.onChangeField }
								id="usernameOrEmail"
								name="usernameOrEmail"
								value={ this.state.usernameOrEmail }
								{ ...isDisabled } />

							<label htmlFor="password" className="login__form-userdata-username">
								{ this.props.translate( 'Password' ) }
							</label>

							<FormPasswordInput
								className="login__form-userdata-username-password"
								onChange={ this.onChangeField }
								id="password"
								name="password"
								value={ this.state.password }
								{ ...isDisabled } />
						</div>

						<div className="login__form-remember-me">
							<label>
								<FormCheckbox
									name="rememberMe"
									checked={ this.state.rememberMe }
									onChange={ this.onChangeRememberMe }
									{ ...isDisabled } />
								<span>{ this.props.translate( 'Stay logged in' ) }</span>
							</label>
						</div>

						<div className="login__form-action">
							<FormsButton primary { ...isDisabled }>
								{ this.props.translate( 'Log in' ) }
							</FormsButton>
						</div>
					</Card>
				</form>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		isRequesting: isRequesting( state ),
		requestError: getRequestError( state ),
	} ),
	{
		loginUser,
		recordTracksEvent
	}
)( localize( LoginForm ) );
