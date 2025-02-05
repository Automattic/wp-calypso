import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { setUnseenCount } from 'calypso/state/notifications/actions';
import getUnseenCount from 'calypso/state/selectors/get-notification-unseen-count';
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
		unseenCount: PropTypes.number,
	};

	state = {
		animationState: 0,
		// unseenCount is null on initial load, so we use hasUnseenNotifications which checks user
		// data as well.
		newNote: this.props.hasUnseenNotifications,
	};

	componentDidUpdate( prevProps ) {
		if ( ! this.props.isNotificationsOpen && prevProps.unseenCount !== this.props.unseenCount ) {
			this.setNotesIndicator( this.props.unseenCount, prevProps.unseenCount );
		}

		if ( ! prevProps.isNotificationsOpen && this.props.isNotificationsOpen ) {
			this.setNotesIndicator( 0 );
			// Ensure we setUnseenCount when opening notes panel. The panel only calls this on
			// APP_RENDER_NOTES which is not consistently called when opening the panel.
			this.props.setUnseenCount( 0 );
		}
	}

	toggleNotesFrame = ( event ) => {
		event.preventDefault();
		event.stopPropagation();

		// Get URL and if it matches "/reader/notifications", don't open the panel
		// As it will cause duplicate notification panels to show
		if ( window.location.pathname === '/reader/notifications' ) {
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
	setNotesIndicator = ( currentUnseenCount, prevUnseenCount ) => {
		let newAnimationState = this.state.animationState;

		if ( 0 === currentUnseenCount ) {
			// If we don't have new notes at load-time, remove the `-1` "init" status
			newAnimationState = 0;
		} else if ( currentUnseenCount > prevUnseenCount ) {
			// Animate the indicator bubble by swapping CSS classes through the animation state
			// Note that we could have an animation state of `-1` indicating the initial load
			newAnimationState = 1 - Math.abs( this.state.animationState );
		}

		this.setState( {
			newNote: currentUnseenCount > 0,
			animationState: newAnimationState,
		} );
	};

	render() {
		const classes = clsx( this.props.className, 'masterbar-notifications', {
			'is-active':
				this.props.isNotificationsOpen || window.location.pathname === '/reader/notifications',
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
					key={ this.state.animationState }
				/>
			</>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isNotificationsOpen: isNotificationsOpen( state ),
		unseenCount: getUnseenCount( state ),
		hasUnseenNotifications: hasUnseenNotifications( state ),
	};
};
const mapDispatchToProps = {
	toggleNotificationsPanel,
	setUnseenCount,
};

export default connect( mapStateToProps, mapDispatchToProps )( MasterbarItemNotifications );
