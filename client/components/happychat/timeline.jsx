/**
 * External dependencies
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { useAutoscroll } from './autoscroll';
import { Button } from '@automattic/components';
import Emojify from 'calypso/components/emojify';
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useScrollbleed } from './scrollbleed';
import { addSchemeIfMissing, setUrlScheme } from './url';

/**
 * Style dependencies
 */
import './timeline.scss';

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:happychat:timeline' );

const MessageParagraph = ( { message, twemojiUrl } ) => (
	<p>
		<Emojify twemojiUrl={ twemojiUrl }>{ message }</Emojify>
	</p>
);

/*
 * Given a message and array of links contained within that message, returns the message
 * with clickable links inside of it.
 */
const MessageWithLinks = ( { message, links, isExternalUrl } ) => {
	const children = links.reduce(
		( { parts, last }, [ url, startIndex, length ] ) => {
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

			if ( last < startIndex ) {
				parts = parts.concat(
					<span key={ parts.length }>{ message.slice( last, startIndex ) }</span>
				);
			}

			parts = parts.concat(
				<a key={ parts.length } href={ href } rel={ rel } target={ target }>
					{ text }
				</a>
			);

			return { parts, last: startIndex + length };
		},
		{ parts: [], last: 0 }
	);

	if ( children.last < message.length ) {
		children.parts = children.parts.concat(
			<span key="last">{ message.slice( children.last ) }</span>
		);
	}

	return <p>{ children.parts }</p>;
};

/*
 * If a message event has a message with links in it, return a component with clickable links.
 * Otherwise just return a single paragraph with the text.
 */
const MessageText = ( props ) =>
	props.links && props.links.length > 0 ? (
		<MessageWithLinks { ...props } />
	) : (
		<MessageParagraph { ...props } />
	);

/*
 * Group messages based on user so when any user sends multiple messages they will be grouped
 * within the same message bubble until it reaches a message from a different user.
 */
const renderGroupedMessages = ( { item, isCurrentUser, twemojiUrl, isExternalUrl }, index ) => {
	const [ event, ...rest ] = item;
	return (
		<div
			className={ classnames( 'happychat__timeline-message', {
				'is-user-message': isCurrentUser,
			} ) }
			key={ event.id || index }
		>
			<div className="happychat__message-text">
				<MessageText
					name={ event.name }
					message={ event.message }
					links={ event.links }
					twemojiUrl={ twemojiUrl }
					isExternalUrl={ isExternalUrl }
				/>
				{ rest.map( ( { message, id, links } ) => (
					<MessageText
						key={ id }
						message={ message }
						links={ links }
						twemojiUrl={ twemojiUrl }
						isExternalUrl={ isExternalUrl }
					/>
				) ) }
			</div>
		</div>
	);
};

const groupMessages = ( messages ) => {
	const grouped = messages.reduce(
		( { user_id, type, group, groups, source }, message ) => {
			const message_user_id = message.user_id;
			const message_type = message.type;
			const message_source = message.source;
			debug( 'compare source', message_source, message.source );
			if ( user_id !== message_user_id || message_type !== type || message_source !== source ) {
				return {
					user_id: message_user_id,
					type: message_type,
					source: message_source,
					group: [ message ],
					groups: group ? groups.concat( [ group ] ) : groups,
				};
			}
			// it's the same user so group it together
			return { user_id, group: group.concat( [ message ] ), groups, type, source };
		},
		{ groups: [] }
	);

	return grouped.groups.concat( [ grouped.group ] );
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
	const { timeline, isCurrentUser, isExternalUrl = () => true, twemojiUrl } = props;
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
				{ groupMessages( timeline ).map( ( item ) => {
					const firstItem = item[ 0 ];
					if ( firstItem.type !== 'message' ) {
						debug( 'no handler for message type', firstItem.type, firstItem );
						return null;
					}
					return renderGroupedMessages( {
						item,
						isCurrentUser: isCurrentUser( firstItem ),
						isExternalUrl,
						twemojiUrl,
					} );
				} ) }
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
	twemojiUrl: PropTypes.string,
};

export default Timeline;
