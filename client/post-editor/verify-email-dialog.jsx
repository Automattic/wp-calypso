/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import Spinner from 'components/spinner';

class VerifyEmailDialog extends React.Component {
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

		this.props.user.sendVerificationEmail( function( error, response ) {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false
			} );
		}.bind( this ) );
	}

	getResendButtonLabel() {
		if ( this.state.emailSent ) {
			return i18n.translate( 'Email Sent' );
		}
		if ( this.state.pendingRequest ) {
			return <Spinner className="post-editor__confirmation-dialog-spinner" />;
		}
		return i18n.translate( 'Resend Email' );
	}

	getDialogButtons() {
		return [
			<FormButton
				key="close"
				isPrimary={ true }
				onClick={ this.props.onClose }>
					{ i18n.translate( 'OK' ) }
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
			confirmHeading: i18n.translate( 'Please confirm your email address' ),

			confirmExplanation: i18n.translate( 'We sent you an email when you first signed up. Please open the message and click the blue button.' ),

			confirmReasoning: i18n.translate( 'Email confirmation allows us to assist when recovering your account in the event you forget your password.' ),

			confirmEmail: i18n.translate(
				'{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/emailPreferences}}',
				{
					components: {
						wrapper: <span className="post-editor__confirmation-dialog-email-wrapper" />,
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
				additionalClassNames="post-editor__confirmation-dialog is-narrow"
			>
				<h1 className="post-editor__confirmation-dialog-heading is-variable-height">{ strings.confirmHeading }</h1>
				<p className="post-editor__confirmation-dialog-email">{ strings.confirmEmail }</p>
				<p className="post-editor__confirmation-dialog-explanation">{ strings.confirmExplanation }</p>
				<p className="post-editor__confirmation-dialog-reasoning">{ strings.confirmReasoning }</p>
			</Dialog>
		);
	}
}

VerifyEmailDialog.propTypes = {
	user: React.PropTypes.object.isRequired,
	onClose: React.PropTypes.func
};

VerifyEmailDialog.defaultProps = {
	onClose: noop
};

export default VerifyEmailDialog;
