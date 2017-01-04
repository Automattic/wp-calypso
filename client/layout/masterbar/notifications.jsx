/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import Notifications from 'notifications';
import store from 'store';
import { recordTracksEvent } from 'state/analytics/actions';

const MasterbarItemNotifications = React.createClass( {
	propTypes: {
		user: React.PropTypes.object.isRequired,
		isActive: React.PropTypes.bool,
		className: React.PropTypes.string,
		onClick: React.PropTypes.func,
		tooltip: React.PropTypes.string,
	},

	getInitialState() {
		const user = this.props.user.get();

		return {
			isShowingPopover: false,
			newNote: user && user.has_unseen_notes,
			animationState: 0,
		};
	},

	checkToggleNotes( event, forceToggle ) {
		const target = event ? event.target : false;
		const notificationNode = this.getNotificationLinkDomNode();

		if ( target && notificationNode.contains( target ) ) {
			return;
		}

		if ( this.state.isShowingPopover || forceToggle === true ) {
			this.toggleNotesFrame( event );
		}
	},

	toggleNotesFrame( event ) {
		if ( event ) {
			event.preventDefault();
		}

		this.setState( {
			isShowingPopover: ! this.state.isShowingPopover
		}, () => {
			this.props.onClick( this.state.isShowingPopover );

			if ( this.state.isShowingPopover ) {
				this.props.recordOpening( store.get( 'wpnotes_unseen_count' ) );
				this.setNotesIndicator( 0 );
			}

			// focus on main window if we just closed the notes panel
			if ( ! this.state.isShowingPopover ) {
				this.getNotificationLinkDomNode().blur();
				window.focus();
			}
		} );
	},

	getNotificationLinkDomNode() {
		return ReactDom.findDOMNode( this.refs.notificationLink );
	},

	/**
	 * Uses the passed number of unseen notifications
	 * and the locally-stored cache of that value to
	 * determine what state the notifications indicator
	 * should be in: on, off, or animate-to-on
	 *
	 * @param {Number} currentUnseenCount Number of reported unseen notifications
	 */
	setNotesIndicator( currentUnseenCount ) {
		const existingUnseenCount = store.get( 'wpnotes_unseen_count' );
		let newAnimationState = this.state.animationState;

		if ( 0 === currentUnseenCount ) {
			// If we don't have new notes at load-time, remove the `-1` "init" status
			newAnimationState = 0;
		} else if ( currentUnseenCount > existingUnseenCount ) {
			// Animate the indicator bubble by swapping CSS classes through the animation state
			// Note that we could have an animation state of `-1` indicating the initial load
			newAnimationState = ( 1 - Math.abs( this.state.animationState ) );
		}

		store.set( 'wpnotes_unseen_count', currentUnseenCount );

		this.setState( {
			newNote: ( currentUnseenCount > 0 ),
			animationState: newAnimationState
		} );
	},

	render() {
		const classes = classNames( this.props.className, {
			'is-active': this.state.isShowingPopover,
			'has-unread': this.state.newNote,
			'is-initial-load': this.state.animationState === -1,
		} );

		return (
			<MasterbarItem
				ref="notificationLink"
				url="/notifications"
				icon="bell"
				onClick={ this.toggleNotesFrame }
				isActive={ this.props.isActive }
				tooltip={ this.props.tooltip }
				className={ classes }
			>
				{ this.props.children }
				<span
					className="masterbar__notifications-bubble"
					key={ 'notification-indicator-animation-state-' + Math.abs( this.state.animationState ) }
				/>
				<Notifications
					visible={ this.state.isShowingPopover }
					checkToggle={ this.checkToggleNotes }
					setIndicator={ this.setNotesIndicator } />
			</MasterbarItem>
		);
	}
} );

const mapDispatchToProps = dispatch => ( {
	recordOpening: unread_notifications => dispatch( recordTracksEvent( 'calypso_notification_open', { unread_notifications } ) )
} );

export default connect( null, mapDispatchToProps )( MasterbarItemNotifications );
