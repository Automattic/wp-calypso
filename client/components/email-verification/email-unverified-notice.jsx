/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import * as React from 'react';

/**
 * Internal dependencies
 */

import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import i18n from 'i18n-calypso';
import userFactory from 'lib/user';

const userLib = userFactory();

export default class EmailUnverifiedNotice extends React.Component {

	state = {
		pendingRequest: false,
		emailSent: false,
		error: null,
	};

	static propTypes = {
		userEmail: PropTypes.string,
		noticeText: PropTypes.node,
		noticeStatus: PropTypes.string
	};

	static defaultProps = {
		noticeText: null,
		noticeStatus: ''
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
			pendingRequest: true
		} );

		userLib.sendVerificationEmail( ( error, response ) => {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false,
			} );
		} );
	};

	renderEmailSendPending() {
		return (
			<Notice
				icon="mail"
				showDismiss={ false }
				text={ i18n.translate( 'Sending…' ) }>
				<NoticeAction><Spinner /></NoticeAction>
			</Notice>
		);
	}

	renderEmailSendSuccess() {
		const noticeText = i18n.translate(
			'We sent another confirmation email to %(email)s.',
			{ args: { email: this.props.userEmail } }
		);

		return (
			<Notice
				text={ noticeText }
				status="is-success"
				onDismissClick={ this.handleDismiss }
				className="email-verification-notice" />
		);
	}

	renderEmailSendError() {
		const noticeText = [
			<strong key="email-send-error">{ i18n.translate( 'The email could not be sent.' ) }</strong>,
			' ',
			this.state.error.message,
		];

		return <Notice
			text={ noticeText }
			icon="notice"
			onDismissClick={ this.handleDismiss }
			status="is-warning"
			className="email-verification-notice">
			<NoticeAction onClick={ this.handleSendVerificationEmail }>
				{ i18n.translate( 'Try Again' ) }
			</NoticeAction>
		</Notice>;
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

		const noticeText = this.props.noticeText
			? this.props.noticeText
			: (
				<div>
					<p>
						<strong>
							{ i18n.translate( 'Please confirm your email address' ) }
						</strong>
					</p>
					<p>
						{
							i18n.translate(
								'To post and keep using WordPress.com you need to confirm your email address. ' +
								'Please click the link in the email we sent at %(email)s.', {
									args: {
										email: this.props.userEmail
									}
								}
							)
						}
					</p>
					<p>
						{
							i18n.translate(
								'{{requestButton}}Re-send your confirmation email{{/requestButton}} ' +
								'or {{changeButton}}change the email address on your account{{/changeButton}}.', {
									components: {
										requestButton: <a href="#" onClick={ this.handleSendVerificationEmail } />,
										changeButton: <a href="/me/account" />
									}
								}
							)
						}
					</p>
				</div>
			);

		return (
			<Notice
				text={ noticeText }
				icon="info"
				showDismiss={ false }
				status={ this.props.noticeStatus }
				className="email-unverified-notice">
				{
					this.props.noticeText &&
					<NoticeAction onClick={ this.handleSendVerificationEmail }>
						{ i18n.translate( 'Resend Email' ) }
					</NoticeAction>
				}
			</Notice>
		);
	}
}
