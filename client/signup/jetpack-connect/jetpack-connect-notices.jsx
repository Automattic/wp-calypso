/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { urlToSlug } from 'lib/url';

class JetpackConnectNotices extends Component {
	static propTypes = {
		noticeType: PropTypes.string,
		url: PropTypes.string
	}

	getNoticeValues() {
		const { translate } = this.props;

		const noticeValues = {
			icon: 'notice',
			status: 'is-error',
			text: translate( 'That\'s not a valid url.' ),
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
			noticeValues.text = translate( 'That\'s a WordPress.com site, so you don\'t need to connect it.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notWordPress' ) {
			noticeValues.icon = 'block';
			noticeValues.text = translate( 'That\'s not a WordPress site.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notActiveJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = translate( 'Jetpack is deactivated.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'outdatedJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = translate( 'You must update Jetpack before connecting.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'jetpackIsDisconnected' ) {
			noticeValues.icon = 'link-break';
			noticeValues.text = translate( 'Jetpack is currently disconnected.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'jetpackIsValid' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'plugins';
			noticeValues.text = translate( 'Jetpack is connected.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notJetpack' ) {
			noticeValues.status = 'is-noticeType';
			noticeValues.icon = 'status';
			noticeValues.text = translate( 'Jetpack couldn\'t be found.' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyConnected' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'status';
			noticeValues.text = translate( 'This site is already connected!' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyOwned' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'status';
			noticeValues.text = translate( 'This site is already connected!' );
			noticeValues.showDismiss = false;
			noticeValues.children = (
				<NoticeAction href={ '/plans/my-plan/' + urlToSlug( this.props.url ) }>
					{ translate( 'Visit' ) }
				</NoticeAction>
			);
			return noticeValues;
		}
		if ( this.props.noticeType === 'wordpress.com' ) {
			noticeValues.text = translate( 'Oops, that\'s us.' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'status';
			return noticeValues;
		}
		if ( this.props.noticeType === 'retryingAuth' ) {
			noticeValues.text = translate( 'Error authorizing. Page is refreshing for an other attempt.' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'retryAuth' ) {
			noticeValues.text = translate( 'In some cases, authorization can take a few attempts. Please try again.' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'secretExpired' ) {
			noticeValues.text = translate( 'Oops, that took a while. You\'ll have to try again.' );
			noticeValues.status = 'is-error';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'defaultAuthorizeError' ) {
			noticeValues.text = translate( 'Error authorizing your site. Please {{link}}contact support{{/link}}.', {
				components: { link: <a href="https://jetpack.com/contact-support" target="_blank" rel="noopener noreferrer" /> }
			} );
			noticeValues.status = 'is-error';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyConnectedByOtherUser' ) {
			noticeValues.text = translate(
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
		const values = this.getNoticeValues();
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
