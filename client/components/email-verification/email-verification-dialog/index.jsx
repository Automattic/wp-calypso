import { Dialog, Button, Spinner } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	verifyEmail,
	resetVerifyEmailState,
} from 'calypso/state/current-user/email-verification/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

import './style.scss';

const noop = () => {};

class VerifyEmailDialog extends Component {
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
			<Button key="close" onClick={ this.handleClose }>
				{ this.props.translate( 'Cancel' ) }
			</Button>,
			<Button
				key="resend"
				primary
				disabled={ includes(
					[ 'requesting', 'sent', 'error' ],
					this.props.emailVerificationStatus
				) }
				onClick={ this.props.verifyEmail }
			>
				{ this.getResendButtonLabel() }
			</Button>,
		];
	}

	render() {
		const strings = {
			confirmHeading: this.props.translate( 'Verify your email' ),

			confirmExplanation: this.props.translate(
				"Check your inbox at %(email)s for the confirmation email, or click 'Resend Email' to get a new one.",
				{
					args: {
						email: this.props.email,
					},
				}
			),

			confirmReasoning: this.props.translate(
				'Verify your email to secure your account and access more features.'
			),

			confirmEmail: this.props.translate(
				"Can't access that email? {{emailPreferences}}Click here to update it.{{/emailPreferences}}",
				{
					components: {
						emailPreferences: <a href="/me/account" />,
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
				<p className="email-verification-dialog__confirmation-dialog-reasoning">
					{ strings.confirmReasoning }
				</p>
				<p className="email-verification-dialog__confirmation-dialog-explanation">
					{ strings.confirmExplanation }
				</p>
				<p className="email-verification-dialog__confirmation-dialog-email">
					{ strings.confirmEmail }
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
	} ),
	{
		verifyEmail,
		resetVerifyEmailState,
	}
)( localize( VerifyEmailDialog ) );
