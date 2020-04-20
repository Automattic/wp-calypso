/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import user from 'lib/user';

class EmailUnverifiedNotice extends React.Component {
	state = {
		pendingRequest: false,
		emailSent: false,
		error: null,
	};

	static propTypes = {
		userEmail: PropTypes.string,
		noticeText: PropTypes.node,
		noticeStatus: PropTypes.string,
	};

	static defaultProps = {
		noticeText: null,
		noticeStatus: '',
	};

	handleDismiss = () => {
		this.setState( { error: null, emailSent: false } );
	};

	handleSendVerificationEmail = ( e ) => {
		e.preventDefault();

		if ( this.state.pendingRequest ) {
			return;
		}

		this.setState( {
			pendingRequest: true,
		} );

		user().sendVerificationEmail( ( error, response ) => {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false,
			} );
		} );
	};

	renderEmailSendPending() {
		return (
			<Notice icon="mail" showDismiss={ false } text={ this.props.translate( 'Sending…' ) }>
				<NoticeAction>
					<Spinner />
				</NoticeAction>
			</Notice>
		);
	}

	renderEmailSendSuccess() {
		const noticeText = this.props.translate( 'We sent another confirmation email to %(email)s.', {
			args: { email: this.props.userEmail },
		} );

		return <Notice text={ noticeText } status="is-success" onDismissClick={ this.handleDismiss } />;
	}

	renderEmailSendError() {
		const noticeText = [
			<strong key="email-send-error">
				{ this.props.translate( 'The email could not be sent.' ) }
			</strong>,
			' ',
			this.state.error.message,
		];

		return (
			<Notice
				text={ noticeText }
				icon="notice"
				onDismissClick={ this.handleDismiss }
				status="is-warning"
			>
				<NoticeAction onClick={ this.handleSendVerificationEmail }>
					{ this.props.translate( 'Try Again' ) }
				</NoticeAction>
			</Notice>
		);
	}

	render() {
		if ( this.state.pendingRequest ) {
			return this.renderEmailSendPending();
		}

		if ( this.state.error ) {
			return this.renderEmailSendError();
		}

		if ( this.state.emailSent ) {
			return this.renderEmailSendSuccess();
		}

		const noticeText = this.props.noticeText ? (
			this.props.noticeText
		) : (
			<div>
				<p>
					<strong>{ this.props.translate( 'Please confirm your email address' ) }</strong>
				</p>
				<p>
					{ this.props.translate(
						'To post and keep using WordPress.com you need to confirm your email address. ' +
							'Please click the link in the email we sent to %(email)s.',
						{
							args: {
								email: this.props.userEmail,
							},
						}
					) }
				</p>
				<p>
					{ this.props.translate(
						'{{requestButton}}Re-send your confirmation email{{/requestButton}} ' +
							'or {{changeButton}}change the email address on your account{{/changeButton}}.',
						{
							components: {
								/* eslint-disable jsx-a11y/anchor-is-valid */
								requestButton: <a href="#" onClick={ this.handleSendVerificationEmail } />,
								/* eslint-enable jsx-a11y/anchor-is-valid */
								changeButton: <a href="/me/account" />,
							},
						}
					) }
				</p>
			</div>
		);

		return (
			<Notice
				text={ noticeText }
				icon="info"
				showDismiss={ false }
				status={ this.props.noticeStatus }
			>
				{ this.props.noticeText && (
					<NoticeAction onClick={ this.handleSendVerificationEmail }>
						{ this.props.translate( 'Resend Email' ) }
					</NoticeAction>
				) }
			</Notice>
		);
	}
}

export default localize( EmailUnverifiedNotice );
