/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

export default React.createClass( {
	displayName: 'JetpackConnectNotices',

	propTypes: {
		noticeType: PropTypes.string,
		siteUrl: PropTypes.string
	},

	getNoticeValues( url ) {
		let noticeValues = {
			icon: 'trash',
			status: 'is-warning',
			text: this.translate( 'That\'s not a real web site' ),
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
			noticeValues.text = this.translate( 'That\'s a WordPress.com site, so you don\'t need to connect it' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notWordPress' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'That\'s not a WordPress site' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notActiveJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'Jetpack is deactivated' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'outdatedJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'You need to update Jetpack before connecting' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'jetpackIsDisconnected' ) {
			noticeValues.icon = 'link-break';
			noticeValues.text = this.translate( 'Jetpack is disconnected' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'jetpackIsValid' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'plugins';
			noticeValues.text = this.translate( 'Jetpack is connected' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notJetpack' ) {
			noticeValues.status = 'is-noticeType';
			noticeValues.icon = 'status';
			noticeValues.text = this.translate( 'Can\'t find Jetpack' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyConnected' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'status';
			noticeValues.text = this.translate( 'This site is already connected!' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'alreadyOwned' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'status';
			noticeValues.text = this.translate( 'You already have connected {{a}}this site!{{/a}}', {
				components: {
					a: <a href={ '/stats/day/' + url } />
				}
			} );
			return noticeValues;
		}
		if ( this.props.noticeType === 'wordpress.com' ) {
			noticeValues.text = this.translate( 'I think that\'s us ¯\\_(ツ)_/¯' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'status';
			return noticeValues;
		}
		if ( this.props.noticeType === 'secretExpired' ) {
			noticeValues.text = this.translate( 'Oops, that took a while. You\'ll have to try again.' );
			noticeValues.status = 'is-error';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		if ( this.props.noticeType === 'authorizeError' ) {
			noticeValues.text = this.translate( 'Error authorizing your site. Please contact support.' );
			noticeValues.status = 'is-error';
			noticeValues.icon = 'notice';
			return noticeValues;
		}
		return;
	},

	render() {
		const urlSlug = this.props.url.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
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
} );
