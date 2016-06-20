/**
 * External dependencies
 */
import * as React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */

import userUtils from 'lib/user/utils';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import i18n from 'i18n-calypso';
import sitesFactory from 'lib/sites-list';
import userFactory from 'lib/user';

const sites = sitesFactory();
const user = userFactory();

export default class EmailUnverifiedNotice extends React.Component {
	constructor( props ) {
		super( props );

		this.updateVerificationState = this.updateVerificationState.bind( this );
		this.handleDismiss = this.handleDismiss.bind( this );
		this.handleSendVerificationEmail = this.handleSendVerificationEmail.bind( this );
		this.handleChangeEmail = this.handleChangeEmail.bind( this );

		this.state = {
			needsVerification: userUtils.needsVerificationForSite( sites.getSelectedSite() ),
			pendingRequest: false,
			emailSent: false,
			error: null,
		};
	}

	componentWillMount() {
		user.on( 'change', this.updateVerificationState );
		user.on( 'verify', this.updateVerificationState );
		sites.on( 'change', this.updateVerificationState );
	}

	componentWillUnmount() {
		user.off( 'change', this.updateVerificationState );
		user.off( 'verify', this.updateVerificationState );
		sites.off( 'change', this.updateVerificationState );
	}

	updateVerificationState() {
		this.setState( {
			needsVerification: userUtils.needsVerificationForSite( sites.getSelectedSite() ),
		} );
	}

	handleDismiss() {
		this.setState( { error: null, emailSent: false } );
	}

	handleChangeEmail( e ) {
		e.preventDefault();
		page( '/me/account' );
	}

	handleSendVerificationEmail( e ) {
		e.preventDefault();

		if ( this.state.pendingRequest ) {
			return;
		}

		this.setState( {
			pendingRequest: true
		} );

		user.sendVerificationEmail( ( error, response ) => {
			this.setState( {
				emailSent: response && response.success,
				error: error,
				pendingRequest: false,
			} );
		} );
	}

	renderEmailSendPending() {
		return (
			<Notice
				icon="mail"
				showDismiss={ false }
				text={ i18n.translate( 'Sending...' ) }>
				<NoticeAction><Spinner /></NoticeAction>
			</Notice>
		);
	}

	renderEmailSendSuccess() {
		let noticeText = i18n.translate(
			'We sent another confirmation email to %(email)s.',
			{ args: { email: user.get().email } }
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
		let noticeText = [
			<strong>{ i18n.translate( 'The email could not be sent.' ) }</strong>,
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

		let noticeText = ( <div>
			<p>
				<strong>{
					i18n.getLocaleSlug() === 'en'
					? i18n.translate( 'To continue, please confirm your email address' )
					: i18n.translate( 'Please confirm your email address' )
				}</strong>
			</p>
			<p>
				{ i18n.getLocaleSlug() === 'en'
					? i18n.translate(
						'Click the link in the email we sent to %(email)s.',
						{ args: { email: user.get().email } } )
					: i18n.translate(
						'To post and keep using WordPress.com you need to confirm your email address. ' +
						'Please click the link in the email we sent at %(email)s.',
						{ args: { email: user.get().email } } )
				}
			</p>
			<p>
				{
					i18n.getLocaleSlug() === 'en'
					? i18n.translate(
						'Didn\'t get it? {{requestButton}}Resend Confirmation Email{{/requestButton}} ' +
						'or {{changeButton}}Change Account Email Address{{/changeButton}}', {
							components: {
								requestButton: <a href="#" tabIndex="0" onClick={ this.handleSendVerificationEmail } />,
								changeButton: <a href="#" tabIndex="0" onClick={ this.handleChangeEmail } />
							} } )
					: i18n.translate(
						'{{requestButton}}Re-send your confirmation email{{/requestButton}} ' +
						'or {{changeButton}}change the email address on your account{{/changeButton}}.', {
							components: {
								requestButton: <a href="#" tabIndex="0" onClick={ this.handleSendVerificationEmail } />,
								changeButton: <a href="#" tabIndex="0" onClick={ this.handleChangeEmail } />
							} } )
				}
			</p>
		</div> );

		return <Notice text={ noticeText } icon="info" showDismiss={ false } className="email-unverified-notice" />;
	}
}
