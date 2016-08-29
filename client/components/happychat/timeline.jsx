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
	forEach,
	propExists
} from './functional';
import autoscroll from './autoscroll';
import AgentW from 'components/happychat/agent-w';
import scrollbleed from './scrollbleed';

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
const messageAvatar = when( propExists( 'meta.image' ), ( { meta } ) => <img alt={ meta.nick } src={ meta.image } /> );

/*
 * Group messages based on user so when any user sends multiple messages they will be grouped
 * within the same message bubble until it reaches a message from a different user.
 */
const renderGroupedMessages = ( { item, isCurrentUser }, index ) => {
	const [ initial, ... rest ] = item;
	const [ message, meta ] = initial;
	const userAvatar = messageAvatar( { meta } );
	return (
		<div className={ classnames( 'happychat__timeline-message', { userMessage: isCurrentUser } ) } key={ meta.id || index }>
			<div className="happychat__message-text">
				{ messageText( {
					message,
					nick: meta.nick,
					key: meta.id,
					links: meta.links
				} ) }
				{ rest.map( ( [ remaining, remaining_meta ] ) => messageText( {
					message: remaining,
					key: remaining_meta.id,
					links: remaining_meta.links
				} ) ) }
			</div>
			<div className="happychat__message-meta">
				<div className="happychat__message-avatar">
				{ isCurrentUser ? userAvatar : <AgentW /> }
				</div>
			</div>
		</div>
	);
};

const itemTypeIs = ( type ) => ( { item } ) => item[ 0 ][ 1 ].type === type;

/*
 * Renders a chat bubble with multiple messages grouped by user.
 */
const renderGroupedTimelineItem = first(
	when( itemTypeIs( 'message' ), renderGroupedMessages ),
	( { item } ) => debug( 'no handler for message type', item[ 0 ][ 1 ].type, item )
);

const groupMessages = ( messages ) => {
	const grouped = messages.reduce( ( { user_id, type, group, groups }, [ message, meta ] ) => {
		const message_user_id = meta.user_id;
		const message_type = meta.type;
		if ( user_id !== message_user_id || message_type !== type ) {
			return {
				user_id: message_user_id,
				type: message_type,
				group: [ [ message, meta ] ],
				groups: group ? groups.concat( [ group ] ) : groups
			};
		}
		// it's the same user so group it together
		return { user_id, group: group.concat( [ [ message, meta ] ] ), groups, type };
	}, { groups: [] } );

	return grouped.groups.concat( [ grouped.group ] );
};

const welcomeMessage = () => (
	<div className="happychat__welcome">
		This is the beginning of your chat history with WordPress.com support. A chat history will be stored here.
	</div>
);

const timelineHasContent = ( { timeline } ) => isArray( timeline ) && ! isEmpty( timeline );

const renderTimeline = ( { timeline, isCurrentUser, onScrollContainer, scrollbleedLock, scrollbleedUnlock } ) => (
	<div className="happychat__conversation"
		ref={ onScrollContainer }
		onMouseEnter={ scrollbleedLock }
		onMouseLeave={ scrollbleedUnlock }>
		{ groupMessages( timeline ).map( ( item ) => renderGroupedTimelineItem( {
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

const mapProps = ( { happychat, currentUser } ) => {
	const { timeline, available, status: connectionStatus } = happychat;
	const { id: current_user_id } = currentUser;
	return {
		available,
		connectionStatus,
		timeline,
		isCurrentUser: ( [ , { user_id } ] ) => user_id === current_user_id
	};
};

export default connect( mapProps )( Timeline );
