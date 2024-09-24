import { Dialog, Button, Spinner } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { emailFormEventEmitter } from 'calypso/me/account/account-email-field';
import {
	verifyEmail,
	resetVerifyEmailState,
} from 'calypso/state/current-user/email-verification/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import './style.scss';

const noop = () => {};

class VerifyEmailDialog extends Component {
	componentDidUpdate( prevProps ) {
		// Close the dialog if the route changes. This dialog may be controlled by a parent
		// component that persists between some routes, and we don't want it to remain open after
		// navigation.
		if ( prevProps.currentRoute !== this.props.currentRoute ) {
			this.handleClose();
		}
	}

	getResendButtonLabel() {
		if (
			'sent' === this.props.emailVerificationStatus ||
			'error' === this.props.emailVerificationStatus
		) {
			return this.props.translate( 'Email Sent' );
		}
		if ( 'requesting' === this.props.emailVerificationStatus ) {
			return <Spinner className="email-verification-dialog__confirmation-dialog-spinner" />;
		}
		return this.props.translate( 'Resend Email' );
	}

	handleClose = () => {
		this.props.resetVerifyEmailState();
		this.props.onClose();
	};

	getDialogButtons() {
		return [
			<Button
				key="resend"
				primary={ false }
				disabled={ includes(
					[ 'requesting', 'sent', 'error' ],
					this.props.emailVerificationStatus
				) }
				onClick={ this.props.verifyEmail }
			>
				{ this.getResendButtonLabel() }
			</Button>,
			<Button key="close" primary onClick={ this.handleClose }>
				{ this.props.translate( 'OK' ) }
			</Button>,
		];
	}

	getEmailPreferencesComponent() {
		const changeEmailRoute = '/me/account';
		if ( this.props.currentRoute !== changeEmailRoute ) {
			return <a href="/me/account" />;
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
		const strings = {
			confirmHeading: this.props.translate( 'Please verify your email address:' ),

			confirmExplanation: this.props.translate(
				'When you first signed up for a WordPress.com account we sent you an email. ' +
					'Please open it and click on the blue button to verify your email address.'
			),

			confirmReasoning: this.props.translate(
				'Verifying your email allows us to assist you if you ' +
					'ever lose access to your account in the future.'
			),

			confirmEmail: this.props.translate(
				'{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/emailPreferences}}',
				{
					components: {
						wrapper: (
							<span className="email-verification-dialog__confirmation-dialog-email-wrapper" />
						),
						emailPreferences: this.getEmailPreferencesComponent(),
					},
					args: {
						email: this.props.email,
					},
				}
			),
		};

		return (
			<Dialog
				additionalClassNames="email-verification-dialog__confirmation-dialog is-narrow"
				buttons={ this.getDialogButtons() }
				isVisible
				label="Email Verification Dialog"
			>
				<h1 className="email-verification-dialog__confirmation-dialog-heading is-variable-height">
					{ strings.confirmHeading }
				</h1>
				<p className="email-verification-dialog__confirmation-dialog-email">
					{ strings.confirmEmail }
				</p>
				<p className="email-verification-dialog__confirmation-dialog-explanation">
					{ strings.confirmExplanation }
				</p>
				<p className="email-verification-dialog__confirmation-dialog-reasoning">
					{ strings.confirmReasoning }
				</p>
			</Dialog>
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
	} ),
	{
		verifyEmail,
		resetVerifyEmailState,
	}
)( localize( VerifyEmailDialog ) );
