import { englishLocales } from '@automattic/i18n-utils';
import { hasTranslation } from '@wordpress/i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import TranslatableString from 'calypso/components/translatable/proptype';
import SidebarMenuItem from 'calypso/layout/global-sidebar/menu-items/menu-item';
import { isE2ETest } from 'calypso/lib/e2e';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getUnseenCount from 'calypso/state/selectors/get-notification-unseen-count';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';
import { BellIcon } from './icon';

import './style.scss';

class SidebarNotifications extends Component {
	static propTypes = {
		className: PropTypes.string,
		title: TranslatableString,
		onClick: PropTypes.func,
		//connected
		isNotificationsOpen: PropTypes.bool,
		unseenCount: PropTypes.number,
		tooltip: TranslatableString,
		translate: PropTypes.func,
		currentUserId: PropTypes.number,
		locale: PropTypes.string,
	};

	state = {
		animationState: 0,
		newNote: this.props.unseenCount > 0,
	};

	componentDidUpdate( prevProps ) {
		if ( ! this.props.isNotificationsOpen && prevProps.unseenCount !== this.props.unseenCount ) {
			this.setNotesIndicator( this.props.unseenCount, prevProps.unseenCount );
		}

		if ( ! prevProps.isNotificationsOpen && this.props.isNotificationsOpen ) {
			this.setNotesIndicator( 0 );
		}
	}

	toggleNotesFrame = ( event ) => {
		event.preventDefault();
		event.stopPropagation();

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

	handleClick = ( event ) => {
		this.toggleNotesFrame( event );
		this.props.onClick();
	};

	render() {
		const classes = classNames( this.props.className, 'sidebar-notifications', {
			'is-active': this.props.isActive,
			'has-unread': this.state.newNote,
			'is-initial-load': this.state.animationState === -1,
		} );

		const shouldShowNotificationsPointer =
			// Show pointer for 2 weeks.
			Date.now() < Date.parse( '23 May 2024' ) &&
			// Show pointer to users registered before 08-May-2024 (when we moved the notifications to the footer).
			this.props.currentUserId < 250450000 &&
			// Show pointer only if translated.
			( englishLocales.includes( this.props.locale ) ||
				hasTranslation( 'Looking for your notifications? They have been moved here.' ) ) &&
			// Hide pointer on E2E tests so it doesn't hide menu items that are expected to be visible.
			! isE2ETest();

		return (
			<>
				{ shouldShowNotificationsPointer &&
					createPortal(
						<DismissibleCard
							className="sidebar-notifications-pointer"
							preferenceName="nav-redesign-notifications-footer-pointer"
						>
							<span>
								{ this.props.translate(
									'Looking for your notifications? They have been moved here.'
								) }
							</span>
						</DismissibleCard>,
						document.querySelector( '.layout' )
					) }
				<SidebarMenuItem
					url="/notifications"
					icon={ <BellIcon newItems={ this.state.newNote } active={ this.props.isActive } /> }
					onClick={ this.handleClick }
					isActive={ this.props.isActive }
					tooltip={ this.props.tooltip }
					tooltipPlacement="top"
					className={ classes }
					key={ this.state.animationState }
				/>
			</>
		);
	}
}

const mapStateToProps = ( state ) => {
	const isPanelOpen = isNotificationsOpen( state );
	return {
		isActive: isPanelOpen || window.location.pathname === '/read/notifications',
		isNotificationsOpen: isPanelOpen,
		unseenCount: getUnseenCount( state ),
		currentUserId: getCurrentUserId( state ),
		locale: getCurrentLocaleSlug( state ),
	};
};
const mapDispatchToProps = {
	toggleNotificationsPanel,
};

export default connect( mapStateToProps, mapDispatchToProps )( SidebarNotifications );
