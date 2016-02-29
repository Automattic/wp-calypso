import React, { PropTypes } from 'react';

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

		if ( this.props.noticeType === 'jetpackIsDeactivated' ) {
			noticeValues.icon = 'block';
			noticeValues.text = this.translate( 'Jetpack is deactivated' );
		}
		if ( this.props.noticeType === 'jetpackIsDisconnected' ) {
			noticeValues.icon = 'link-break';
			noticeValues.text = this.translate( 'Jetpack is disconnected' );
		}
		if ( this.props.noticeType === 'jetpackIsValid' ) {
			noticeValues.status = 'is-success';
			noticeValues.icon = 'plugins';
			noticeValues.text = this.translate( 'Jetpack is connected' );
		}
		if ( this.props.noticeType === 'jetpackNotInstalled' ) {
			noticeValues.status = 'is-noticeType';
			noticeValues.icon = 'status';
			noticeValues.text = this.translate( 'Can\'t find Jetpack' );
		}
		return noticeValues;
	},

	render() {
		const values = this.getNoticeValues();
		return (
			<div className="jetpack-connect__notices-container">
				<Notice { ...values } onDismissClick={ this.props.onDismissClick } />
			</div>
		);
	}
} );
