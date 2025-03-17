import { Button, Spinner } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { emailFormEventEmitter } from 'calypso/me/account/account-email-field';
import {
	resetVerifyEmailState,
	verifyEmail,
} from 'calypso/state/current-user/email-verification/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { setUserSetting } from 'calypso/state/user-settings/actions';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';

import './style.scss';

const noop = () => {};

class VerifyEmailDialog extends Component {
	state = {
		resendPendingStatus: false,
	};

	componentDidUpdate( prevProps ) {
		// Close the dialog if the route changes. This dialog may be controlled by a parent
		// component that persists between some routes, and we don't want it to remain open after
		// navigation.
		if ( prevProps.currentRoute !== this.props.currentRoute ) {
			this.handleClose();
		}
	}

	getResendButtonLabel() {
		const statusToCheck = this.props.isPendingEmailChange
			? this.state.resendPendingStatus
			: this.props.emailVerificationStatus;
		if ( 'sent' === statusToCheck || 'error' === statusToCheck ) {
			return this.props.translate( 'Email sent' );
		}
		if ( 'requesting' === statusToCheck ) {
			return <Spinner className="email-verification-dialog__confirmation-dialog-spinner" />;
		}
		return this.props.translate( 'Resend email' );
	}

	handleClose = () => {
		this.props.resetVerifyEmailState();
		this.props.onClose();
	};

	verifyEmail = async () => {
		if ( this.props.isPendingEmailChange ) {
			// This is a hack to resend the pending change email. We resave the setting for the new
			// pending email with its current value which will trigger the email.
			this.props.setUserSetting( 'user_email', this.props.userSettings?.new_user_email );
			try {
				this.setState( { resendPendingStatus: 'requesting' } );
				await this.props.saveUnsavedUserSettings( [ 'user_email' ] );
				this.setState( { resendPendingStatus: 'sent' } );
				const emailSentMessage = this.props.translate(
					'We sent an email to %(email)s. Please check your inbox to verify your email.',
					{
						args: {
							email: this.props.userSettings?.new_user_email,
						},
					}
				);
				this.props.successNotice( emailSentMessage );
				this.props.onClose();
			} catch ( error ) {
				this.setState( { resendPendingStatus: 'error' } );
			}
		} else {
			this.props.verifyEmail();
		}
	};

	getDialogButtons() {
		const { closeButtonAction, closeLabel, translate } = this.props;

		const onClickClose = () => {
			if ( typeof closeButtonAction === 'function' ) {
				closeButtonAction();
			}
			this.handleClose();
		};

		return [
			<Button key="close" onClick={ onClickClose } borderless plain compact>
				{ closeLabel || translate( 'Cancel' ) }
			</Button>,
			<Button
				key="resend"
				primary
				disabled={
					includes( [ 'requesting', 'sent', 'error' ], this.props.emailVerificationStatus ) ||
					includes( [ 'requesting', 'sent', 'error' ], this.state.resendPendingStatus )
				}
				onClick={ this.verifyEmail }
			>
				{ this.getResendButtonLabel() }
			</Button>,
		];
	}

	getEmailPreferencesComponent() {
		const changeEmailRoute = '/me/account';
		if ( this.props.currentRoute !== changeEmailRoute ) {
			return <a href="/me/account?focusEmail=1" />;
		}
		// If we are already on /me/account, close the dialog and dispatch an event to highlight the input.
		return (
			<Button
				borderless
				plain
				compact
				onClick={ () => {
					emailFormEventEmitter?.dispatchEvent( new Event( 'highlightInput' ) );
					this.handleClose();
				} }
			/>
		);
	}

	render() {
		const { isPendingEmailChange: isEmailPendingChange, email, translate } = this.props;
		const { new_user_email } = this.props.userSettings || {};

		const strings = {
			confirmHeading: translate( 'Verify your email' ),

			confirmExplanation: translate(
				'Secure your account and access more features. Check your inbox at {{wrapper}}%(email)s{{/wrapper}} for the confirmation email, or click "Resend Email" to get a new one.',
				{
					components: {
						wrapper: (
							<span className="email-verification-dialog__confirmation-dialog-email-wrapper" />
						),
					},
					args: {
						email: isEmailPendingChange && new_user_email ? new_user_email : email,
					},
				}
			),

			confirmEmail: translate(
				"Can't access that email? {{emailPreferences}}Update it{{/emailPreferences}}.",
				{
					components: {
						emailPreferences: this.getEmailPreferencesComponent(),
					},
				}
			),
		};

		return (
			<Modal
				className="email-verification-dialog__confirmation-dialog is-narrow"
				role="dialog"
				isVisible
				label="Email Verification Dialog"
				aria-labelledby="Email Verification Dialog"
				onRequestClose={ this.props.onClose }
				title={ strings.confirmHeading }
			>
				<p className="email-verification-dialog__confirmation-dialog-explanation">
					{ strings.confirmExplanation }
				</p>
				<p className="email-verification-dialog__confirmation-dialog-email">
					{ strings.confirmEmail }
				</p>
				<div className="email-verification-dialog__buttons-container">
					{ this.getDialogButtons() }
				</div>
			</Modal>
		);
	}
}

VerifyEmailDialog.propTypes = {
	onClose: PropTypes.func,
	translate: PropTypes.func,
	// connected props:
	email: PropTypes.string,
	emailVerificationStatus: PropTypes.string,
};

VerifyEmailDialog.defaultProps = {
	onClose: noop,
};

export default connect(
	( state ) => ( {
		email: getCurrentUserEmail( state ),
		emailVerificationStatus: get( state, 'currentUser.emailVerification.status' ),
		currentRoute: getCurrentRoute( state ),
		isPendingEmailChange: isPendingEmailChange( state ),
		userSettings: getUserSettings( state ),
	} ),
	{
		verifyEmail,
		resetVerifyEmailState,
		setUserSetting,
		saveUnsavedUserSettings,
		successNotice,
	}
)( localize( VerifyEmailDialog ) );
