/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import i18n from 'lib/mixins/i18n';

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

	getDialogButtons() {
		return [
			<FormButton
				key="publish"
				isPrimary={ true }
				onClick={ this.props.onTryAgain }>
					{ i18n.translate( 'I clicked on the email, publish' ) }
			</FormButton>,
			<FormButton
				key="close"
				isPrimary={ false }
				onClick={ this.props.onClose }>
					{ i18n.translate( 'Back' ) }
			</FormButton>
		];
	}

	render() {
		const strings = {
			postSaved: i18n.translate( 'Post saved.' ),
			urgeToVerify: i18n.translate( 'To publish, please verify your email address.' ),
			validationEmailSent: i18n.translate(
				'You should have received an email at {{strong}}%(email)s{{/strong}} when you registered, with a link to validate your email address. If you can\'t find the email, just {{sendAgain}}click here to send it again{{/sendAgain}}.',
				{
					components: {
						strong: <strong />,
						sendAgain: <a href="#" onClick={ this.handleSendVerification } />
					},
					args: {
						email: this.props.user.data.email
					}
				}
			),
			userEmailWrong: i18n.translate(
				'If the email address above is wrong, {{emailPreferences}}click here to change it{{/emailPreferences}} in your preferences.',
				{
					components: {
						emailPreferences: <a href="/me/account" />
					}
				}
			)
		};

		return (
			<Dialog
				isVisible={ true }
				buttons={ this.getDialogButtons() }
				additionalClassNames="verification-modal"
			>
				<h1>
					{ strings.postSaved }<br />
					{ strings.urgeToVerify }
				</h1>
				<p>{ strings.validationEmailSent }</p>
				<p>{ strings.userEmailWrong }</p>
			</Dialog>
		);
	}
}

VerifyEmailDialog.propTypes = {
	user: React.PropTypes.object.isRequired,
	onClose: React.PropTypes.func,
	onTryAgain: React.PropTypes.func
};

VerifyEmailDialog.defaultProps = {
	onClose: noop,
	onTryAgain: noop
};

export default VerifyEmailDialog;
