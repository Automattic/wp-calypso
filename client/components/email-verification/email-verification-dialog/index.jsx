/**
 * External dependencies
 */
import React, { Component } from 'react';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import Spinner from 'components/spinner';
import userFactory from 'lib/user';

const user = userFactory();

class VerifyEmailDialog extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			pendingRequest: false,
			emailSent: false,
			error: false
		};

		this.handleSendVerification = this.sendVerification.bind( this );
	}

	sendVerification( e ) {
		e.preventDefault();

		if ( this.state.pendingRequest ) {
			return;
		}

		this.setState( { pendingRequest: true } );

		user.sendVerificationEmail( function( error, response ) {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false
			} );
		}.bind( this ) );
	}

	getResendButtonLabel() {
		if ( this.state.emailSent ) {
			return this.props.translate( 'Email Sent' );
		}
		if ( this.state.pendingRequest ) {
			return <Spinner className="email-verification-dialog__confirmation-dialog-spinner" />;
		}
		return this.props.translate( 'Resend Email' );
	}

	getDialogButtons() {
		return [
			<FormButton
				key="close"
				isPrimary={ true }
				onClick={ this.props.onClose }>
					{ this.props.translate( 'OK' ) }
			</FormButton>,
			<FormButton
				key="resend"
				isPrimary={ false }
				disabled={ this.state.pendingRequest || this.state.emailSent }
				onClick={ this.handleSendVerification }>
				{ this.getResendButtonLabel() }
			</FormButton>
		];
	}

	render() {
		const strings = {
			confirmHeading: this.props.translate( 'Please confirm your email address' ),

			confirmExplanation: this.props.translate( 'We sent you an email when you first signed up. ' +
				'Please open the message and click the blue button.' ),

			confirmReasoning: this.props.translate( 'Email confirmation allows us to assist when recovering ' +
				'your account in the event you forget your password.' ),

			confirmEmail: this.props.translate(
				'{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/emailPreferences}}',
				{
					components: {
						wrapper: <span className="email-verification-dialog__confirmation-dialog-email-wrapper" />,
						emailPreferences: <a href="/me/account" />
					},
					args: {
						email: this.props.user.data.email
					}
				}
			)
		};

		return (
			<Dialog
				isVisible={ true }
				buttons={ this.getDialogButtons() }
				additionalClassNames="email-verification-dialog__confirmation-dialog is-narrow"
			>
				<h1 className="email-verification-dialog__confirmation-dialog-heading is-variable-height">{ strings.confirmHeading }</h1>
				<p className="email-verification-dialog__confirmation-dialog-email">{ strings.confirmEmail }</p>
				<p className="email-verification-dialog__confirmation-dialog-explanation">{ strings.confirmExplanation }</p>
				<p className="email-verification-dialog__confirmation-dialog-reasoning">{ strings.confirmReasoning }</p>
			</Dialog>
		);
	}
}

VerifyEmailDialog.propTypes = {
	user: React.PropTypes.object.isRequired,
	onClose: React.PropTypes.func,
	translate: React.PropTypes.func,
};

VerifyEmailDialog.defaultProps = {
	onClose: noop
};

export default localize( VerifyEmailDialog );
