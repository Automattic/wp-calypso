import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import store from 'store';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarMenuItem from 'calypso/layout/global-sidebar/menu-items/menu-item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getShouldShowGlobalSiteSidebar } from 'calypso/state/global-sidebar/selectors';
import hasUnseenNotifications from 'calypso/state/selectors/has-unseen-notifications';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { BellIcon } from './icon';

import './style.scss';

class SidebarNotifications extends Component {
	static propTypes = {
		isActive: PropTypes.bool,
		className: PropTypes.string,
		title: TranslatableString,
		onClick: PropTypes.func,
		//connected
		isNotificationsOpen: PropTypes.bool,
		hasUnseenNotifications: PropTypes.bool,
		tooltip: TranslatableString,
		shouldShowGlobalSiteSidebar: PropTypes.bool,
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

	handleClick = ( event ) => {
		this.toggleNotesFrame( event );
		this.props.onClick();
	};

	render() {
		const classes = classNames( this.props.className, 'sidebar-notifications', {
			'is-active':
				this.props.isNotificationsOpen || window.location.pathname === '/read/notifications',
			'has-unread': this.state.newNote,
			'is-initial-load': this.state.animationState === -1,
		} );

		return (
			<>
				<SidebarMenuItem
					url="/notifications"
					icon={ <BellIcon newItems={ this.state.newNote } active={ this.props.isActive } /> }
					onClick={ this.handleClick }
					isActive={ this.props.isActive }
					tooltip={ this.props.tooltip }
					className={ classes }
					ref={ this.notificationLink }
					key={ this.state.animationState }
					tooltipPlacement={ this.props.shouldShowGlobalSiteSidebar ? 'bottom-left' : 'bottom' }
				/>
				<div className="sidebar-notifications__panel" ref={ this.notificationPanel }>
					<AsyncLoad
						require="calypso/notifications"
						isShowing={ this.props.isNotificationsOpen }
						checkToggle={ this.checkToggleNotes }
						setIndicator={ this.setNotesIndicator }
						isGlobalSidebarVisible={ true }
						placeholder={ null }
					/>
				</div>
			</>
		);
	}
}

const mapStateToProps = ( state, { currentSection } ) => {
	const sectionGroup = currentSection?.group ?? null;
	const sectionName = currentSection?.name ?? null;
	const siteId = getSelectedSiteId( state );
	const shouldShowGlobalSiteSidebar = getShouldShowGlobalSiteSidebar(
		state,
		siteId,
		sectionGroup,
		sectionName
	);
	return {
		isNotificationsOpen: isNotificationsOpen( state ),
		hasUnseenNotifications: hasUnseenNotifications( state ),
		shouldShowGlobalSiteSidebar,
	};
};
const mapDispatchToProps = {
	toggleNotificationsPanel,
	recordTracksEvent,
};

export default withCurrentRoute(
	connect( mapStateToProps, mapDispatchToProps )( SidebarNotifications )
);
