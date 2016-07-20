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

		const { resendState } = this.state;

		const resendEmail = () => {
			this.setState( {
				resendState: RESEND_IN_PROGRESS,
			} );

			sendVerificationEmail( ( error, response ) => {
				if ( error ) {
					this.setState( {
						resendState: RESEND_ERROR,
					} );

					return;
				}

				this.setState( {
					resendState: RESEND_SUCCESS,
				} );
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

		const resendStateToNoticeType = ( resendState ) => {
			switch ( resendState ) {
				case RESEND_IDLE:
					return 'is-warning';
				case RESEND_IN_PROGRESS:
					return 'is-info';
				case RESEND_SUCCESS:
					return 'is-success';
				case RESEND_ERROR:
					return 'is-error';
				default:
					return 'is-error';
			}
		};

		return (
			<Notice
				status={ resendStateToNoticeType( resendState ) }
				showDismiss={ false }
				text={ resendStateToMessage( resendState ) }>
				{ RESEND_IDLE === resendState &&
					<NoticeAction href="#" onClick={ resendEmail } >
						{ this.props.translate( "Resend Email" ) }
					</NoticeAction>
				}
			</Notice>
		);
	}
}

export default localize( HelpUnverifiedWarning );
