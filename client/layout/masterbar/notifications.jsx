/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import store from 'store';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	hasCurrentUserUnseenNotifications,
	isNotificationsPanelOpen,
	getNotificationsAnimationState,
	getNotificationsNewNoteStatus,
} from 'state/selectors';
import {
	setNotificationsIndicator,
	toggleNotificationsPanel
} from 'state/ui/notifications/actions';

class MasterbarItemNotifications extends Component {
	static propTypes = {
		getNotificationsLink: React.PropTypes.func.isRequired,
		newNote: React.PropTypes.bool.isRequired,
		notificationsPanelIsOpen: React.PropTypes.bool.isRequired,
		isActive: React.PropTypes.bool,
		className: React.PropTypes.string,
		onClick: React.PropTypes.func,
		tooltip: React.PropTypes.string,
	};

	toggleNotesFrame = ( event ) => {
		if ( event ) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
		}

		this.props.onClick();
	};

	render() {
		const {
			className,
			isActive,
			hasUnseenNotifications,
			animationState,
			getNotificationsLink,
			notificationsPanelIsOpen,
			tooltip
		} = this.props;

		const classes = classNames( className, {
			'is-active': notificationsPanelIsOpen,
			'has-unread': hasUnseenNotifications,
			'is-initial-load': animationState === -1,
		} );

		return (
			<div ref={ getNotificationsLink }>
				<MasterbarItem
					url="/notifications"
					icon="bell"
					onClick={ this.toggleNotesFrame }
					isActive={ isActive }
					renderAsAnchor={ false }
					tooltip={ tooltip }
					className={ classes }
				>
					{ this.props.children }
					<span className="masterbar__notifications-bubble" />
				</MasterbarItem>
			</div>
		);
	}
}

const mapStateToProps = state => ( {
	hasUnseenNotifications: hasCurrentUserUnseenNotifications( state ),
	notificationsPanelIsOpen: isNotificationsPanelOpen( state ),
	animationState: getNotificationsAnimationState( state ),
} );

const mapDispatchToProps = {
	recordOpening: partial( recordTracksEvent, 'calypso_notification_open' )
};

export default connect( mapStateToProps, mapDispatchToProps )( MasterbarItemNotifications );
