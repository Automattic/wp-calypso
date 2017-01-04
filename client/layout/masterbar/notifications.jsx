/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';

import {
	propEq
} from 'ramda';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import Notifications from 'notifications';
import store from 'store';
import wpcom from 'lib/wp';

import fromApi from 'notifications/from-api';

export default React.createClass( {
	displayName: 'MasterbarItemNotifications',

	propTypes: {
		user: React.PropTypes.object.isRequired,
		isActive: React.PropTypes.bool,
		className: React.PropTypes.string,
		onClick: React.PropTypes.func,
		tooltip: React.PropTypes.string,
	},

	componentDidMount() {
		wpcom
			.req
			.get( {
				path: '/notifications/',
				apiVersion: '1.1'
			}, { number: 100 } )
			.then( response => {
				const { notes } = fromApi( response );
				console.log( notes[0] );

				this.setState( { notes } );
			} );
	},

	getInitialState() {
		let user = this.props.user.get();

		return {
			isShowingPopover: false,
			newNote: user && user.has_unseen_notes,
			animationState: 0,
			notes: [],
			selectedNote: null,
			selectedFilter: 'All'
		};
	},

	selectNote( selectedNote ) {
		this.setState( { selectedNote } );
	},

	selectFilter( selectedFilter ) {
		this.setState( { selectedFilter } );
	},

	toggleNotesFrame( event ) {
		if ( event ) {
			event.preventDefault();

			const notesPanel = document.getElementById( 'wpnt-notes-panel2' );
			if ( notesPanel && notesPanel.contains( event.target ) ) {
				event.stopPropagation();
				return;
			}
		}

		this.setState( {
			isShowingPopover: ! this.state.isShowingPopover
		}, () => {
			this.props.onClick( this.state.isShowingPopover );

			if ( this.state.isShowingPopover ) {
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
		let existingUnseenCount = store.get( 'wpnotes_unseen_count' );
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
				{ this.state.isShowingPopover &&
					<Notifications
						notes={ this.state.notes }
						selectNote={ this.selectNote }
						selectedNote={ this.state.selectedNote }
						selectedFilter={ this.state.selectedFilter }
						selectFilter={ this.selectFilter }
						setIndicator={ this.setNotesIndicator }
						unselectNote={ () => this.selectNote( null ) }
					/>
				}
			</MasterbarItem>
		);
	}
} );
