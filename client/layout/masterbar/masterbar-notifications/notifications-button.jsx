import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import store from 'store';
import AsyncLoad from 'calypso/components/async-load';
import TranslatableString from 'calypso/components/translatable/proptype';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import hasUnseenNotifications from 'calypso/state/selectors/has-unseen-notifications';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';
import MasterbarItem from '../item';
import { BellIcon } from './notifications-bell-icon';

import './notifications-style.scss';

class MasterbarItemNotifications extends Component {
	static propTypes = {
		isActive: PropTypes.bool,
		className: PropTypes.string,
		tooltip: TranslatableString,
		//connected
		isNotificationsOpen: PropTypes.bool,
		hasUnseenNotifications: PropTypes.bool,
	};

	notificationLink = createRef();
	notificationPanel = createRef();

	state = {
		animationState: 0,
		newNote: this.props.hasUnseenNotifications,
	};

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.isNotificationsOpen && this.props.isNotificationsOpen ) {
			this.props.recordTracksEvent( 'calypso_notification_open', {
				unread_notifications: store.get( 'wpnotes_unseen_count' ),
			} );
			this.setNotesIndicator( 0 );
		}

		// focus on main window if we just closed the notes panel
		if ( prevProps.isNotificationsOpen && ! this.props.isNotificationsOpen ) {
			this.notificationLink.current.blur();
			this.notificationPanel.current.blur();
			window.focus();
		}
	}

	checkToggleNotes = ( event, forceToggle ) => {
		const target = event ? event.target : false;

		// Ignore clicks or other events which occur inside of the notification panel.
		if (
			target &&
			( this.notificationLink.current.contains( target ) ||
				this.notificationPanel.current.contains( target ) )
		) {
			return;
		}

		if ( this.props.isNotificationsOpen || forceToggle === true ) {
			this.toggleNotesFrame( event );
		}
	};

	toggleNotesFrame = ( event ) => {
		if ( event ) {
			event.preventDefault && event.preventDefault();
			event.stopPropagation && event.stopPropagation();
		}
		// Get URL and if it matches "/read/notifications", don't open the panel
		// As it will cause duplicate notification panels to show
		if ( window.location.pathname === '/read/notifications' ) {
			return;
		}

		this.props.toggleNotificationsPanel();
	};

	/**
	 * Uses the passed number of unseen notifications
	 * and the locally-stored cache of that value to
	 * determine what state the notifications indicator
	 * should be in: on, off, or animate-to-on
	 * @param {number} currentUnseenCount Number of reported unseen notifications
	 */
	setNotesIndicator = ( currentUnseenCount ) => {
		const existingUnseenCount = store.get( 'wpnotes_unseen_count' );
		let newAnimationState = this.state.animationState;

		if ( 0 === currentUnseenCount ) {
			// If we don't have new notes at load-time, remove the `-1` "init" status
			newAnimationState = 0;
		} else if ( currentUnseenCount > existingUnseenCount ) {
			// Animate the indicator bubble by swapping CSS classes through the animation state
			// Note that we could have an animation state of `-1` indicating the initial load
			newAnimationState = 1 - Math.abs( this.state.animationState );
		}

		store.set( 'wpnotes_unseen_count', currentUnseenCount );

		this.setState( {
			newNote: currentUnseenCount > 0,
			animationState: newAnimationState,
		} );
	};

	render() {
		const classes = classNames( this.props.className, 'masterbar-notifications', {
			'is-active':
				this.props.isNotificationsOpen || window.location.pathname === '/read/notifications',
			'has-unread': this.state.newNote,
			'is-initial-load': this.state.animationState === -1,
		} );

		return (
			<>
				<MasterbarItem
					url="/notifications"
					icon={ <BellIcon newItems={ this.state.newNote } active={ this.props.isActive } /> }
					onClick={ this.toggleNotesFrame }
					isActive={ this.props.isActive }
					tooltip={ this.props.tooltip }
					className={ classes }
					ref={ this.notificationLink }
					key={ this.state.animationState }
				/>
				<div className="masterbar-notifications__panel" ref={ this.notificationPanel }>
					<AsyncLoad
						require="calypso/notifications"
						isShowing={ this.props.isNotificationsOpen }
						checkToggle={ this.checkToggleNotes }
						setIndicator={ this.setNotesIndicator }
						placeholder={ null }
					/>
				</div>
			</>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isNotificationsOpen: isNotificationsOpen( state ),
		hasUnseenNotifications: hasUnseenNotifications( state ),
	};
};
const mapDispatchToProps = {
	toggleNotificationsPanel,
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( MasterbarItemNotifications );
