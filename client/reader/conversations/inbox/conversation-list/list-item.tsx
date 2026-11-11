import { useLocale } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import {
	VisuallyHidden,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { usePrefetchPostComments } from 'calypso/reader/data/comments';
import { usePost } from 'calypso/reader/data/post';
import { formatCompactTime } from './format-compact-time';
import type { Density } from './toolbar';
import type { Conversation, OwnComment } from 'calypso/reader/data/conversations';

export type OpenSource = 'click' | 'tab_key' | 'shortcut' | 'button';

/** A row in the list: a conversation, or on Your comments, one of the user's comments. */
export type InboxItem = Conversation | OwnComment;

interface Props {
	item: InboxItem;
	isSelected: boolean;
	openOnFocus: boolean;
	followFocus: boolean;
	density: Density;
	onSelect: ( item: InboxItem, source: OpenSource ) => void;
}

const MAX_AVATARS = 5;

function getContextLine(
	translate: ReturnType< typeof useTranslate >,
	{ reason, commenters, commenterCount }: Conversation
) {
	const [ { name } ] = commenters;
	const othersCount = Math.max( commenterCount, commenters.length ) - 1;
	const options = { args: { name, count: othersCount }, components: { b: <strong /> } };
	if ( othersCount > 0 ) {
		return translate(
			'{{b}}%(name)s{{/b}} and %(count)d other',
			'{{b}}%(name)s{{/b}} and %(count)d others',
			{ ...options, count: othersCount }
		);
	}
	switch ( reason ) {
		case 'own_post':
			return translate( '{{b}}%(name)s{{/b}} commented on your post', options );
		case 'reply':
			return translate( '{{b}}%(name)s{{/b}} replied to you', options );
		case 'mention':
			return translate( '{{b}}%(name)s{{/b}} mentioned you', options );
		default:
			return <strong>{ name }</strong>;
	}
}

export function ConversationListItem( {
	item,
	isSelected,
	openOnFocus,
	followFocus,
	density,
	onSelect,
}: Props ) {
	const translate = useTranslate();
	const locale = useLocale();
	const { siteId, postId, excerpt, timestamp } = item;
	const isOwnComment = 'commentId' in item;
	const { data: post } = usePost( item.title ? null : { blogId: siteId, postId } );
	const title = item.title || String( post?.title ?? '' );
	const unreadCount = isOwnComment ? item.newCommentCount : item.unreadCount;
	const newCount = unreadCount > 0 && (
		<Text
			size={ 12 }
			lineHeight="16px"
			weight={ 500 }
			color="var(--color-primary)"
			className="conversations-inbox__item-new"
		>
			{ translate( '%(count)s new', '%(count)s new', {
				count: unreadCount,
				args: { count: formatNumber( unreadCount ) },
			} ) }
		</Text>
	);
	const itemRef = useRef< HTMLLIElement >( null );
	const isMountedRef = useRef( false );
	const openedOnFocusRef = useRef( false );
	const pointerDownRef = useRef( false );
	const prefetchPostComments = usePrefetchPostComments();
	const prefetchComments = () => prefetchPostComments( { siteId, postId } );

	useEffect( () => {
		const isFirstRun = ! isMountedRef.current;
		isMountedRef.current = true;
		const item = itemRef.current;
		if ( ! isSelected || ! item ) {
			return;
		}
		item.scrollIntoView( { block: 'nearest' } );
		// Follow j/k with the focus so Tab moves on from the open conversation. Leave it
		// alone on first render and when it sits elsewhere, like the previous/next buttons.
		const { activeElement, body } = item.ownerDocument;
		const list = item.closest( '.conversations-inbox__list' );
		if (
			! isFirstRun &&
			followFocus &&
			( activeElement === body || list?.contains( activeElement ) )
		) {
			item.querySelector( 'button' )?.focus( { preventScroll: true } );
		}
	}, [ isSelected, followFocus ] );

	return (
		<li ref={ itemRef }>
			<VStack
				as="button"
				spacing={ 2 }
				type="button"
				className={ clsx( 'conversations-inbox__item', {
					'is-selected': isSelected,
					// Your comments count newer replies, which opening doesn't clear, so they aren't unread.
					'is-unread': ! isOwnComment && unreadCount > 0,
				} ) }
				aria-current={ isSelected || undefined }
				onClick={ () => {
					// A press on an item that already has focus, or in Safari, fires no focus event.
					pointerDownRef.current = false;
					// A click focuses the item first, which has already opened it.
					if ( openedOnFocusRef.current ) {
						openedOnFocusRef.current = false;
						return;
					}
					onSelect( item, 'click' );
				} }
				onPointerEnter={ prefetchComments }
				onPointerDown={ () => {
					pointerDownRef.current = true;
				} }
				onPointerCancel={ () => {
					pointerDownRef.current = false;
				} }
				onBlur={ () => {
					pointerDownRef.current = false;
				} }
				// Tabbing onto a conversation opens it, like j/k.
				onFocus={ () => {
					const source = pointerDownRef.current ? 'click' : 'tab_key';
					pointerDownRef.current = false;
					prefetchComments();
					if ( openOnFocus && ! isSelected ) {
						openedOnFocusRef.current = true;
						onSelect( item, source );
					}
				} }
			>
				<HStack as="span">
					<Text
						size={ 13 }
						lineHeight="20px"
						weight={ 600 }
						color="inherit"
						className="conversations-inbox__item-title"
					>
						{ title }
					</Text>
					<Text size={ 12 } lineHeight="16px" color="var(--color-text-subtle)">
						<span aria-hidden="true">{ formatCompactTime( timestamp, locale ) }</span>
						<VisuallyHidden>{ formatCompactTime( timestamp, locale, 'long' ) }</VisuallyHidden>
					</Text>
					{ density !== 'comfortable' && newCount }
				</HStack>
				{ density !== 'compact' && ! isOwnComment && item.commenters.length > 0 && (
					<HStack as="span" justify="flex-start">
						<HStack
							as="span"
							spacing={ 0 }
							expanded={ false }
							className="conversations-inbox__avatars"
						>
							{ /* Two commenters can share a name, and the list never reorders. */ }
							{ item.commenters.slice( 0, MAX_AVATARS ).map( ( { avatar }, index ) => (
								<img key={ index } src={ avatar } alt="" width={ 20 } height={ 20 } />
							) ) }
						</HStack>
						<Text size={ 13 } lineHeight="20px" color="inherit">
							{ getContextLine( translate, item ) }
						</Text>
					</HStack>
				) }
				{ density === 'comfortable' && (
					<HStack as="span">
						<Text
							size={ 13 }
							lineHeight="20px"
							color="inherit"
							className="conversations-inbox__item-excerpt"
						>
							{ excerpt }
						</Text>
						{ newCount }
					</HStack>
				) }
			</VStack>
		</li>
	);
}
