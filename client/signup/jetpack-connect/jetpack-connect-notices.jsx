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
		noticeType: PropTypes.string
	},

	getNoticeValues() {
		let noticeValues = {
			icon: 'trash',
			status: 'is-warning',
			text: this.translate( 'That\'s not a real web site' )
		};

		if ( this.props.noticeType === 'notExists' ) {
			return noticeValues
		}
		if ( this.props.noticeType === 'isDotCom' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'That\'s is a WordPress.com site, so you don\'t need to connect it' );
			return noticeValues;
		}
		if ( this.props.noticeType === 'notWordPress' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'That\'s not a WordPress site' );
			return noticeValues
		}
		if ( this.props.noticeType === 'notActiveJetpack' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'Jetpack is deactivated' );
			return noticeValues
		}
		if ( this.props.noticeType === 'jetpackIsDisconnected' ) {
			noticeValues.icon = 'link-break';
			noticeValues.text = this.translate( 'Jetpack is disconnected' );
			return noticeValues
		}
		if ( this.props.noticeType === 'jetpackIsValid' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'plugins';
			noticeValues.text = this.translate( 'Jetpack is connected' );
			return noticeValues
		}
		if ( this.props.noticeType === 'notJetpack' ) {
			noticeValues.status = 'is-noticeType';
			noticeValues.icon = 'status';
			noticeValues.text = this.translate( 'Can\'t find Jetpack' );
			return noticeValues
		}
		if ( this.props.noticeType === 'alreadyConnected' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'status';
			noticeValues.text = this.translate( 'This site is already connected!' );
			return noticeValues
		}
		if ( this.props.noticeType === 'wordpress.com' ) {
			noticeValues.text = this.translate( 'I think that\'s us ¯\\_(ツ)_/¯' );
			noticeValues.status = 'is-warning';
			noticeValues.icon = 'status';
			return noticeValues
		}
		return;
	},

	render() {
		const values = this.getNoticeValues();
		if ( values ) {
			return (
				<div className="jetpack-connect__notices-container">
					<Notice { ...values } onDismissClick={ this.props.onDismissClick } />
				</div>
			);
		}
		return null;
	}
} );
