import { useLocale } from '@automattic/i18n-utils';
import {
	VisuallyHidden,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { usePost } from 'calypso/reader/data/post';
import { formatCompactTime } from './format-compact-time';
import type { Density } from './toolbar';
import type { Conversation } from '../group-notes';

export type OpenSource = 'click' | 'tab_key' | 'shortcut' | 'button';

interface Props {
	conversation: Conversation;
	isSelected: boolean;
	openOnFocus: boolean;
	density: Density;
	onSelect: ( conversation: Conversation, source: OpenSource ) => void;
}

const MAX_AVATARS = 5;

function getContextLine(
	translate: ReturnType< typeof useTranslate >,
	{ context, commenters }: Conversation
) {
	const [ { name } ] = commenters;
	const othersCount = commenters.length - 1;
	const options = { args: { name, count: othersCount }, components: { b: <strong /> } };
	if ( othersCount > 0 ) {
		return translate(
			'{{b}}%(name)s{{/b}} and %(count)d other',
			'{{b}}%(name)s{{/b}} and %(count)d others',
			{ ...options, count: othersCount }
		);
	}
	switch ( context ) {
		case 'post':
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
	conversation,
	isSelected,
	openOnFocus,
	density,
	onSelect,
}: Props ) {
	const translate = useTranslate();
	const locale = useLocale();
	const { siteId, postId, excerpt, timestamp, commenters, unreadNoteIds } = conversation;
	const { data: post } = usePost( conversation.title ? null : { blogId: siteId, postId } );
	const title = conversation.title || String( post?.title ?? '' );
	const unreadCount = unreadNoteIds.length;
	const newCount = unreadCount > 0 && (
		<Text color="var(--color-primary)" className="conversations-inbox__item-new">
			{ translate( '%(count)d new', { args: { count: unreadCount } } ) }
		</Text>
	);
	const itemRef = useRef< HTMLLIElement >( null );
	const isMountedRef = useRef( false );
	const openedOnFocusRef = useRef( false );
	const pointerDownRef = useRef( false );

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
		if ( ! isFirstRun && ( activeElement === body || list?.contains( activeElement ) ) ) {
			item.querySelector( 'button' )?.focus( { preventScroll: true } );
		}
	}, [ isSelected ] );

	return (
		<li ref={ itemRef }>
			<VStack
				as="button"
				spacing={ 2.5 }
				type="button"
				className={ clsx( 'conversations-inbox__item', {
					'is-selected': isSelected,
					'is-unread': unreadCount > 0,
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
					onSelect( conversation, 'click' );
				} }
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
					if ( openOnFocus && ! isSelected ) {
						openedOnFocusRef.current = true;
						onSelect( conversation, source );
					}
				} }
			>
				<HStack as="span">
					<span className="conversations-inbox__item-title">{ title }</span>
					<Text size={ 14 } color="var(--color-text-subtle)">
						<span aria-hidden="true">{ formatCompactTime( timestamp, locale ) }</span>
						<VisuallyHidden>{ formatCompactTime( timestamp, locale, 'long' ) }</VisuallyHidden>
					</Text>
					{ density !== 'comfortable' && newCount }
				</HStack>
				{ density !== 'compact' && commenters.length > 0 && (
					<HStack as="span" justify="flex-start">
						<HStack
							as="span"
							spacing={ 0 }
							expanded={ false }
							className="conversations-inbox__avatars"
						>
							{ commenters.slice( 0, MAX_AVATARS ).map( ( { name, avatar } ) => (
								<img key={ name } src={ avatar } alt="" width={ 24 } height={ 24 } />
							) ) }
						</HStack>
						<span>{ getContextLine( translate, conversation ) }</span>
					</HStack>
				) }
				{ density === 'comfortable' && (
					<HStack as="span">
						<span className="conversations-inbox__item-excerpt">{ excerpt }</span>
						{ newCount }
					</HStack>
				) }
			</VStack>
		</li>
	);
}
