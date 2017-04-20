/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { urlToSlug } from 'lib/url';

class JetpackConnectNotices extends Component {
	static propTypes = {
		noticeType: PropTypes.string,
		siteUrl: PropTypes.string
	}

	getNoticeValues() {
		const noticeValues = {
			icon: 'notice',
			status: 'is-error',
			text: this.props.translate( 'That\'s not a valid url.' ),
			showDismiss: false
		};

		if ( this.props.onDismissClick ) {
			noticeValues.onDismissClick = this.props.onDismissClick;
			noticeValues.showDismiss = true;
		}

		if ( this.props.noticeType === 'notExists' ) {
			return noticeValues;
		}
		if ( this.props.noticeType === 'isDotCom' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.props.translate( 'That\'s a WordPress.com site, so you don\'t need to connect it.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notWordPress' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.props.translate( 'That\'s not a WordPress site.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notActiveJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.props.translate( 'Jetpack is deactivated.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'outdatedJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.props.translate( 'You must update Jetpack before connecting.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'jetpackIsDisconnected' ) {
			noticeValues.icon = 'link-break';
			noticeValues.text = this.props.translate( 'Jetpack is currently disconnected.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'jetpackIsValid' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'plugins';
			noticeValues.text = this.props.translate( 'Jetpack is connected.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notJetpack' ) {
			noticeValues.status = 'is-noticeType';
			noticeValues.icon = 'status';
			noticeValues.text = this.props.translate( 'Jetpack couldn\'t be found.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyConnected' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'status';
			noticeValues.text = this.props.translate( 'This site is already connected!' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'wordpress.com' ) {
			noticeValues.text = this.props.translate( 'Oops, that\'s us.' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'status';
			return noticeValues;
		}
		if ( this.props.noticeType === 'retryingAuth' ) {
			noticeValues.text = this.props.translate( 'Error authorizing. Page is refreshing for another attempt.' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'retryAuth' ) {
			noticeValues.text = this.props.translate( 'In some cases, authorization can take a few attempts. Please try again.' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'secretExpired' ) {
			noticeValues.text = this.props.translate( 'Oops, that took a while. You\'ll have to try again.' );
			noticeValues.status = 'is-error';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'defaultAuthorizeError' ) {
			noticeValues.text = this.props.translate( 'Error authorizing your site. Please {{link}}contact support{{/link}}.', {
				components: { link: <a href="https://jetpack.com/contact-support" target="_blank" rel="noopener noreferrer" /> }
			} );
			noticeValues.status = 'is-error';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyConnectedByOtherUser' ) {
			noticeValues.text = this.props.translate(
				'This site is already connected to a different WordPress.com user, ' +
				'you need to disconnect that user before you can connect another.'
			);
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'notice';
			return noticeValues;
		}

		return;
	}

	render() {
		const urlSlug = this.props.url ? urlToSlug( this.props.url ) : '';
		const values = this.getNoticeValues( urlSlug );
		if ( values ) {
			return (
				<div className="jetpack-connect__notices-container">
					<Notice { ...values } />
				</div>
			);
		}
		return null;
	}
}

export default localize( JetpackConnectNotices );
