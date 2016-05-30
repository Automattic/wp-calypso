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
import Spinner from 'components/spinner';
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
				{ this.state.emailSent ?
					i18n.translate( 'Email Sent' ) :
					( this.state.pendingRequest ?
						<Spinner /> :
						i18n.translate( 'Resend Email' )
					)
				}
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
						wrapper: <span />,
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
				additionalClassNames="confirmation-dialog"
			>
				<h1>{ strings.confirmHeading }</h1>
				<p className="confirmation-dialog__email">{ strings.confirmEmail }</p>
				<p className="confirmation-dialog__explanation">{ strings.confirmExplanation }</p>
				<p className="confirmation-dialog__reasoning">{ strings.confirmReasoning }</p>
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
