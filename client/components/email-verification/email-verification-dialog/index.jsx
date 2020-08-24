/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get, includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';
import Spinner from 'components/spinner';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import { verifyEmail, resetVerifyEmailState } from 'state/current-user/email-verification/actions';

/**
 * Style dependencies
 */
import './style.scss';

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
			<Button key="close" primary={ true } onClick={ this.handleClose }>
				{ this.props.translate( 'OK' ) }
			</Button>,
		];
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
						emailPreferences: <a href="/me/account" />,
					},
					args: {
						email: this.props.email,
					},
				}
			),
		};

		return (
			<Dialog
				isVisible={ true }
				buttons={ this.getDialogButtons() }
				additionalClassNames="email-verification-dialog__confirmation-dialog is-narrow"
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
	} ),
	{
		verifyEmail,
		resetVerifyEmailState,
	}
)( localize( VerifyEmailDialog ) );
