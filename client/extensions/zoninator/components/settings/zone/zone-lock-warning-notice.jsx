/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { requestFeed } from '../../../state/feeds/actions';
import { requestLock, resetLock } from '../../../state/locks/actions';
import { requestZones } from '../../../state/zones/actions';
import { blocked } from '../../../state/locks/selectors';

class ZoneLockWarningNotice extends PureComponent {
	static propTypes = {
		isBlocked: PropTypes.bool,
		requestFeed: PropTypes.func.isRequired,
		requestLock: PropTypes.func.isRequired,
		requestZones: PropTypes.func.isRequired,
		resetLock: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
		zoneId: PropTypes.number.isRequired,
	};

	refreshLock = () => {
		// Refresh the forms as well if the zone was blocked by another user
		if ( this.props.isBlocked ) {
			this.props.requestFeed( this.props.siteId, this.props.zoneId );
			this.props.requestZones( this.props.siteId );
		}

		this.props.resetLock( this.props.siteId, this.props.zoneId );
		this.props.requestLock( this.props.siteId, this.props.zoneId );
	};

	noticeText = isBlocked =>
		isBlocked
			? this.props.translate(
					'This zone is currently being edited by another user. Try again in a moment.'
			  )
			: this.props.translate( 'You have reached the maximum idle limit. Refresh to continue.' );

	render() {
		const { isBlocked, translate } = this.props;

		return (
			<div>
				<Notice showDismiss={ false } status="is-warning" text={ this.noticeText( isBlocked ) }>
					<NoticeAction onClick={ this.refreshLock }>{ translate( 'Refresh' ) }</NoticeAction>
				</Notice>
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { siteId, zoneId } ) => ( { isBlocked: blocked( state, siteId, zoneId ) } ),
	{ requestFeed, requestLock, requestZones, resetLock }
);

export default flowRight( connectComponent, localize )( ZoneLockWarningNotice );
