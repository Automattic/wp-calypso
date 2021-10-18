import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { sendEvent } from 'calypso/state/happychat/connection/actions';
import { useAutoscroll } from './autoscroll';
import { useScrollbleed } from './scrollbleed';
import { addSchemeIfMissing, setUrlScheme } from './url';

import './timeline.scss';

class MessageLink extends Component {
	handleClick = () => {
		const { href, messageId, sendEventMessage, userId } = this.props;

		sendEventMessage( `Opened ${ href }` );
		recordTracksEvent( 'calypso_happychat_message_link_opened', {
			message_id: messageId,
			user_id: userId,
			href,
		} );
	};

	handleMouseDown = ( evt ) => {
		const { href, messageId, sendEventMessage, userId } = this.props;

		// Ignore left-clicks, the onClick handler will catch these
		if ( evt.button === 0 ) {
			return;
		}

		sendEventMessage( `Alt-clicked ${ href }` );
		recordTracksEvent( 'calypso_happychat_message_link_alt_click', {
			message_id: messageId,
			user_id: userId,
			href,
		} );
	};

	render() {
		const { children, href, rel, target } = this.props;
		return (
			<a
				href={ href }
				rel={ rel }
				target={ target }
				onClick={ this.handleClick }
				onMouseDown={ this.handleMouseDown }
			>
				{ children }
			</a>
		);
	}
}

const MessageLinkConnected = connect( ( state ) => ( { userId: getCurrentUserId( state ) } ), {
	sendEventMessage: sendEvent,
} )( MessageLink );

const FormattedMessageText = ( { message, messageId, links = [], isExternalUrl } ) => {
	const children = [];
	let lastIndex = 0;

	links.forEach( ( [ url, linkStartIndex, length ] ) => {
		// If there's text before this link, add it.
		if ( lastIndex < linkStartIndex ) {
			children.push( message.slice( lastIndex, linkStartIndex ) );
		}

		const text = url;
		let href = url;
		let rel = null;
		let target = null;

		href = addSchemeIfMissing( href, 'http' );
		if ( isExternalUrl( href ) ) {
			rel = 'noopener noreferrer';
			target = '_blank';
		} else if ( typeof window !== 'undefined' ) {
			// Force internal URLs to the current scheme to avoid a page reload
			const scheme = window.location.protocol.replace( /:+$/, '' );
			href = setUrlScheme( href, scheme );
		}
		children.push(
			<MessageLinkConnected href={ href } rel={ rel } target={ target } messageId={ messageId }>
				{ text }
			</MessageLinkConnected>
		);
		lastIndex = linkStartIndex + length;
	} );
	if ( lastIndex < message.length ) {
		children.push( message.slice( lastIndex ) );
	}

	return children.map( ( child, index ) => <Fragment key={ index }>{ child }</Fragment> );
};

/*
 * Render a formatted message.
 */
const Message = ( { message, messageId, isEdited, isOptimistic, links = [], isExternalUrl } ) => {
	return (
		<p className={ classnames( { 'is-optimistic': isOptimistic } ) }>
			<FormattedMessageText
				message={ message }
				messageId={ messageId }
				links={ links }
				isExternalUrl={ isExternalUrl }
			/>
			{ isEdited && <small className="happychat__message-edited-flag">(edited)</small> }
		</p>
	);
};

/*
 * Group messages based on user so when any user sends multiple messages they will be grouped
 * within the same message bubble until it reaches a message from a different user.
 */
const renderGroupedMessages = ( { messages, isCurrentUser, isExternalUrl }, index ) => {
	return (
		<div
			className={ classnames( 'happychat__timeline-message', {
				'is-user-message': isCurrentUser,
			} ) }
			key={ messages[ 0 ].id || index }
		>
			<div className="happychat__message-text">
				{ messages.map( ( { message, id, isEdited, isOptimistic, links } ) => (
					<Message
						key={ id }
						message={ message }
						messageId={ id }
						isEdited={ isEdited }
						isOptimistic={ isOptimistic }
						links={ links }
						isExternalUrl={ isExternalUrl }
					/>
				) ) }
			</div>
		</div>
	);
};

const groupMessages = ( messages ) => {
	const groups = [];
	let user_id;
	let type;
	let source;

	messages.forEach( ( message ) => {
		if ( user_id !== message.user_id || type !== message.type || source !== message.source ) {
			// This message is not like the others in this group, start a new group...
			groups.push( [] );
			// ... and update the comparison variables to what we expect to find in this new group.
			( { user_id, type, source } = message );
		}
		// Add this message to the last group.
		groups[ groups.length - 1 ].push( message );
	} );

	return groups;
};

function WelcomeMessage( { currentUserEmail } ) {
	const translate = useTranslate();

	return (
		<div className="happychat__welcome">
			<p>
				{ translate(
					"Welcome to WordPress.com support chat! We'll send a transcript to %s at the end of the chat.",
					{
						args: currentUserEmail,
					}
				) }
			</p>
		</div>
	);
}

function getMessagesOlderThan( timestamp, messages ) {
	if ( ! timestamp ) {
		return [];
	}
	return messages.filter( ( m ) => m.timestamp >= timestamp );
}

function Timeline( props ) {
	const { timeline, isCurrentUser, isExternalUrl = () => true } = props;
	const autoscroll = useAutoscroll();
	const scrollbleed = useScrollbleed();

	const unreadMessagesCount = useMemo(
		() => getMessagesOlderThan( autoscroll.disabledAt, timeline ).length,
		[ autoscroll.disabledAt, timeline ]
	);

	const prevUnreadMessagesCount = useRef( unreadMessagesCount );

	useEffect( () => {
		if ( prevUnreadMessagesCount.current === 0 && unreadMessagesCount > 0 ) {
			recordTracksEvent( 'calypso_happychat_unread_messages_button_show' );
		} else if ( prevUnreadMessagesCount.current > 0 && unreadMessagesCount === 0 ) {
			recordTracksEvent( 'calypso_happychat_unread_messages_button_hide' );
		}

		prevUnreadMessagesCount.current = unreadMessagesCount;
	}, [ unreadMessagesCount ] );

	function onScrollContainer( el ) {
		autoscroll.setTarget( el );
		scrollbleed.setTarget( el );
	}

	const handleUnreadMessagesButtonClick = useCallback( () => {
		recordTracksEvent( 'calypso_happychat_unread_messages_button_click' );
		autoscroll.enableAutoscroll();
	}, [ autoscroll ] );

	if ( timeline.length === 0 ) {
		return <WelcomeMessage currentUserEmail={ props.currentUserEmail } />;
	}

	return (
		<>
			<div
				className="happychat__conversation"
				ref={ onScrollContainer }
				onMouseEnter={ scrollbleed.lock }
				onMouseLeave={ scrollbleed.unlock }
			>
				{ groupMessages( timeline ).map( ( messages ) =>
					renderGroupedMessages( {
						messages,
						isCurrentUser: isCurrentUser( messages[ 0 ] ),
						isExternalUrl,
					} )
				) }
			</div>
			{ unreadMessagesCount > 0 && (
				<div className="happychat__unread-messages-container">
					<Button
						primary
						className="happychat__unread-messages-button"
						onClick={ handleUnreadMessagesButtonClick }
					>
						{ unreadMessagesCount } new message{ unreadMessagesCount ? 's' : '' }
						<Gridicon icon="arrow-down" />
					</Button>
				</div>
			) }
		</>
	);
}

Timeline.propTypes = {
	currentUserEmail: PropTypes.string,
	isCurrentUser: PropTypes.func,
	isExternalUrl: PropTypes.func,
	timeline: PropTypes.array,
};

export default Timeline;
