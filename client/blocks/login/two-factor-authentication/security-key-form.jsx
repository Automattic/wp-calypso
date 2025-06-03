import { Card, Spinner } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { formUpdate, loginUserWithSecurityKey } from 'calypso/state/login/actions';
import TwoFactorActions from './two-factor-actions';
import './verification-code-form.scss';
import './security-key-form.scss';

class SecurityKeyForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		loginUserWithSecurityKey: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		switchTwoFactorAuthType: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		showOrDivider: PropTypes.bool,
		isWoo: PropTypes.bool,
	};

	static defaultProps = {
		isWoo: false,
	};

	state = {
		isAuthenticating: false,
	};

	componentDidMount() {
		this.initiateSecurityKeyAuthentication();
	}

	initiateSecurityKeyAuthentication = () => {
		const { onSuccess } = this.props;
		this.setState( { isAuthenticating: true } );
		this.props
			.loginUserWithSecurityKey()
			.then( () => onSuccess() )
			.catch( () => this.setState( { isAuthenticating: false } ) );
	};

	render() {
		const { translate, isWoo, switchTwoFactorAuthType } = this.props;

		return (
			<form
				className={ clsx( 'two-factor-authentication__verification-code-form-wrapper', {
					isWoo: isWoo,
				} ) }
				onSubmit={ ( event ) => {
					event.preventDefault();
					this.initiateSecurityKeyAuthentication();
				} }
			>
				<Card className="two-factor-authentication__verification-code-form">
					{ ! this.state.isAuthenticating && (
						<div className="security-key-form__help-text">
							<p>
								{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
									components: {
										strong: <strong />,
									},
								} ) }
							</p>
							<p>
								{ translate(
									'Insert your hardware security key, or follow the instructions in your browser or phone to log in.'
								) }
							</p>
						</div>
					) }
					{ this.state.isAuthenticating && (
						<div className="security-key-form__add-wait-for-key">
							<Spinner />
							<p className="security-key-form__add-wait-for-key-heading">
								{ translate( 'Waiting for security key' ) }
							</p>
							<p>
								{ translate(
									'Connect and touch your security key to log in, or follow the directions in your browser or pop-up.'
								) }
							</p>
						</div>
					) }
					<Button
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus
						variant="primary"
						disabled={ this.state.isAuthenticating }
						type="submit"
						accessibleWhenDisabled
						__next40pxDefaultSize
					>
						{ translate( 'Continue with security key' ) }
					</Button>
				</Card>

				<TwoFactorActions
					twoFactorAuthType="webauthn"
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
				/>
			</form>
		);
	}
}

export default connect( null, {
	formUpdate,
	loginUserWithSecurityKey,
	recordTracksEvent,
} )( localize( SecurityKeyForm ) );
