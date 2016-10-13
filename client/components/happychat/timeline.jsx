/**
 *	External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import assign from 'lodash/assign';
import { connect } from 'react-redux';

/**
 *	Internal dependencies
 */
import {
	first,
	when,
	forEach
} from './functional';
import autoscroll from './autoscroll';
import scrollbleed from './scrollbleed';
import { translate } from 'i18n-calypso';
import { getCurrentUser } from 'state/current-user/selectors';
import {
	getHappychatConnectionStatus,
	getHappychatTimeline
} from 'state/happychat/selectors';

const debug = require( 'debug' )( 'calypso:happychat:timeline' );

const linksNotEmpty = ( { links } ) => ! isEmpty( links );

const messageParagraph = ( { message, key } ) => <p key={ key }>{ message }</p>;

/*
 * Given a message and array of links contained within that message, returns the message
 * with clickable links inside of it.
 */
const messageWithLinks = ( { message, key, links } ) => {
	const children = links.reduce( ( { parts, last }, [ url, startIndex, length ] ) => {
		if ( last < startIndex ) {
			parts = parts.concat( <span key={ parts.length }>{ message.slice( last, startIndex ) }</span> );
		}
		parts = parts.concat( <a key={ parts.length } href={ url } rel="noopener noreferrer" target="_blank">{ url }</a> );
		return { parts, last: startIndex + length };
	}, { parts: [], last: 0 } );

	if ( children.last < message.length ) {
		children.parts = children.parts.concat( <span key="last">{ message.slice( children.last ) }</span> );
	}

	return <p key={ key }>{ children.parts }</p>;
};

/*
 * If a message event has a message with links in it, return a component with clickable links.
 * Otherwise just return a single paragraph with the text.
 */
const messageText = when( linksNotEmpty, messageWithLinks, messageParagraph );

/*
 * Group messages based on user so when any user sends multiple messages they will be grouped
 * within the same message bubble until it reaches a message from a different user.
 */
const renderGroupedMessages = ( { item, isCurrentUser }, index ) => {
	const [ event, ... rest ] = item;
	return (
		<div className={ classnames( 'happychat__timeline-message', { 'is-user-message': isCurrentUser } ) } key={ event.id || index }>
			<div className="happychat__message-text">
				{ messageText( {
					message: event.message,
					name: event.name,
					key: event.id,
					links: event.links
				} ) }
				{ rest.map( ( { message, id: key, links } ) => messageText( { message, key, links } ) ) }
			</div>
		</div>
	);
};

const itemTypeIs = type => ( { item: [ firstItem ] } ) => firstItem.type === type;

/*
 * Renders a chat bubble with multiple messages grouped by user.
 */
const renderGroupedTimelineItem = first(
	when( itemTypeIs( 'message' ), renderGroupedMessages ),
	( { item: [ firstItem ] } ) => debug( 'no handler for message type', firstItem.type, firstItem )
);

const groupMessages = messages => {
	const grouped = messages.reduce( ( { user_id, type, group, groups }, message ) => {
		const message_user_id = message.user_id;
		const message_type = message.type;
		if ( user_id !== message_user_id || message_type !== type ) {
			return {
				user_id: message_user_id,
				type: message_type,
				group: [ message ],
				groups: group ? groups.concat( [ group ] ) : groups
			};
		}
		// it's the same user so group it together
		return { user_id, group: group.concat( [ message ] ), groups, type };
	}, { groups: [] } );

	return grouped.groups.concat( [ grouped.group ] );
};

const welcomeMessage = () => (
	<div className="happychat__welcome">
		{ translate( 'Welcome to WordPress.com support chat!' ) }
	</div>
);

const timelineHasContent = ( { timeline } ) => isArray( timeline ) && ! isEmpty( timeline );

const renderTimeline = ( { timeline, isCurrentUser, onScrollContainer, scrollbleedLock, scrollbleedUnlock } ) => (
	<div className="happychat__conversation"
		ref={ onScrollContainer }
		onMouseEnter={ scrollbleedLock }
		onMouseLeave={ scrollbleedUnlock }>
		{ groupMessages( timeline ).map( item => renderGroupedTimelineItem( {
			item,
			isCurrentUser: isCurrentUser( item[ 0 ] )
		} ) ) }
	</div>
);

const chatTimeline = when( timelineHasContent, renderTimeline, welcomeMessage );

export const Timeline = React.createClass( {
	mixins: [ autoscroll, scrollbleed ],

	getDefaultProps() {
		return {
			onScrollContainer: () => {}
		};
	},

	render() {
		const { onScrollContainer } = this.props;
		return chatTimeline( assign( {}, this.props, {
			onScrollContainer: forEach( this.setupAutoscroll, onScrollContainer, this.setScrollbleedTarget ),
			scrollbleedLock: this.scrollbleedLock,
			scrollbleedUnlock: this.scrollbleedUnlock
		} ) );
	}
} );

const mapProps = state => {
	const current_user = getCurrentUser( state );
	return {
		connectionStatus: getHappychatConnectionStatus( state ),
		timeline: getHappychatTimeline( state ),
		isCurrentUser: ( { user_id } ) => user_id === current_user.ID
	};
};

export default connect( mapProps )( Timeline );
