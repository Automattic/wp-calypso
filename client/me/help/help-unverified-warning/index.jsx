/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

const RESEND_IDLE = 0,
	RESEND_IN_PROGRESS = 1,
	RESEND_SUCCESS = 2,
	RESEND_ERROR = 3;

class HelpUnverifiedWarning extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			resendState: RESEND_IDLE,
		};
	}

	render() {
		const { sendVerificationEmail } = this.props;

		const resendEmail = () => {
			sendVerificationEmail( ( error, response ) => {
			} );
		};

		const resendStateToMessage = ( resendState ) => {
			switch ( resendState ) {
				case RESEND_IDLE:
					return this.props.translate( "Trouble activating your account? Just click this button and we'll resend the activation for you." );
				case RESEND_IN_PROGRESS:
					return this.props.translate( 'Sending…' );
				case RESEND_SUCCESS:
					return this.props.translate( "Please check your email for an activation email and click the link to finish your signup. If you don't receive the email within a few minutes, please be sure to check your spam folders." );
				case RESEND_ERROR:
					return this.props.translate( "Sorry that we've encountered an error on sending you an activation email. Please try again later." );
				default:
					return 'Unknown activation email resending state.';
			}
		};

		return (
			<Notice
				status="is-warning"
				showDismiss={ false }
				text={ resendStateToMessage( this.state.resendState ) }>
				<NoticeAction href="#" onClick={ resendEmail } >
					{ this.props.translate( "Resend Email" ) }
				</NoticeAction>
			</Notice>
		);
	}
}

export default localize( HelpUnverifiedWarning );
