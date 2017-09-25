/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

class JetpackConnectNotices extends Component {
	static propTypes = {
		noticeType: PropTypes.oneOf( [
			'alreadyConnected',
			'alreadyConnectedByOtherUser',
			'alreadyOwned',
			'defaultAuthorizeError',
			'isDotCom',
			'jetpackIsValid',
			'notActiveJetpack',

			// notConnectedJetpack is expected, but no notice is shown.
			'notConnectedJetpack',
			'notExists',
			'notJetpack',
			'notWordPress',
			'outdatedJetpack',
			'retryAuth',
			'retryingAuth',
			'secretExpired',
			'wordpress.com',
		] ).isRequired,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
	};

	getNoticeValues() {
		const { noticeType, onDismissClick, translate } = this.props;

		const noticeValues = {
			icon: 'notice',
			status: 'is-error',
			text: translate( "That's not a valid url." ),
			showDismiss: false,
		};

		if ( onDismissClick ) {
			noticeValues.onDismissClick = onDismissClick;
			noticeValues.showDismiss = true;
		}

		switch ( noticeType ) {
			case 'notExists':
				return noticeValues;

			case 'isDotCom':
				noticeValues.icon = 'block';
				noticeValues.text = translate(
					"That's a WordPress.com site, so you don't need to connect it."
				);
				return noticeValues;

			case 'notWordPress':
				noticeValues.icon = 'block';
				noticeValues.text = translate( "That's not a WordPress site." );
				return noticeValues;

			case 'notActiveJetpack':
				noticeValues.icon = 'block';
				noticeValues.text = translate( 'Jetpack is deactivated.' );
				return noticeValues;

			case 'outdatedJetpack':
				noticeValues.icon = 'block';
				noticeValues.text = translate( 'You must update Jetpack before connecting.' );
				return noticeValues;

			case 'jetpackIsDisconnected':
				noticeValues.icon = 'link-break';
				noticeValues.text = translate( 'Jetpack is currently disconnected.' );
				return noticeValues;

			case 'jetpackIsValid':
				noticeValues.status = 'is-success';
				noticeValues.icon = 'plugins';
				noticeValues.text = translate( 'Jetpack is connected.' );
				return noticeValues;

			case 'notJetpack':
				noticeValues.status = 'is-notice';
				noticeValues.icon = 'status';
				noticeValues.text = translate( "Jetpack couldn't be found." );
				return noticeValues;

			case 'wordpress.com':
				noticeValues.text = translate( "Oops, that's us." );
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'status';
				return noticeValues;

			case 'retryingAuth':
				noticeValues.text = translate(
					'Error authorizing. Page is refreshing for another attempt.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				return noticeValues;

			case 'retryAuth':
				noticeValues.text = translate(
					'In some cases, authorization can take a few attempts. Please try again.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				return noticeValues;

			case 'secretExpired':
				noticeValues.text = translate( "Oops, that took a while. You'll have to try again." );
				noticeValues.status = 'is-error';
				noticeValues.icon = 'notice';
				return noticeValues;

			case 'defaultAuthorizeError':
				noticeValues.text = translate(
					'Error authorizing your site. Please {{link}}contact support{{/link}}.',
					{
						components: {
							link: (
								<a
									href="https://jetpack.com/contact-support"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				);
				noticeValues.status = 'is-error';
				noticeValues.icon = 'notice';
				return noticeValues;

			case 'alreadyConnectedByOtherUser':
				noticeValues.text = translate(
					'This site is already connected to a different WordPress.com user, ' +
						'you need to disconnect that user before you can connect another.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				return noticeValues;
			case 'userIsAlreadyConnectedToSite':
				noticeValues.text = translate(
					'This WordPress.com account is already connected to an other user on this site. ' +
						'Please login to an other WordPress.com account to complete the connection.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				return noticeValues;
		}
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
