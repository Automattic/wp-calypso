import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { KeyboardShortcuts } from '../keyboard-shortcuts';
import { ConversationListItem, type InboxItem, type OpenSource } from './list-item';
import { ConversationListTabs, type InboxTab } from './tabs';
import { ConversationListToolbar, type Density, type SortOrder } from './toolbar';

import './style.scss';

interface Props {
	items: InboxItem[];
	unreadCount: number;
	isLoading: boolean;
	isError?: boolean;
	onRetry?: () => void;
	hasMore?: boolean;
	isLoadingMore?: boolean;
	isLoadMoreError?: boolean;
	onLoadMore?: () => void;
	tab: InboxTab;
	onTabChange: ( tab: InboxTab ) => void;
	search: string;
	onSearchChange: ( search: string ) => void;
	density: Density;
	onDensityChange: ( density: Density ) => void;
	sort: SortOrder;
	onSortChange: ( sort: SortOrder ) => void;
	/** Loaded conversations with notes to mark, which can be fewer than `unreadCount`. */
	markAllCount: number;
	onMarkAllRead: () => void;
	isShortcutsOpen: boolean;
	onShortcutsToggle: ( isOpen: boolean ) => void;
	selectedKey?: string;
	openOnFocus: boolean;
	onSelect: ( item: InboxItem, source: OpenSource ) => void;
}

export function ConversationList( {
	items,
	unreadCount,
	isLoading,
	isError,
	onRetry,
	hasMore,
	isLoadingMore,
	isLoadMoreError,
	onLoadMore,
	tab,
	onTabChange,
	search,
	onSearchChange,
	density,
	onDensityChange,
	sort,
	onSortChange,
	markAllCount,
	onMarkAllRead,
	isShortcutsOpen,
	onShortcutsToggle,
	selectedKey,
	openOnFocus,
	onSelect,
}: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { ref: endRef, inView: isEndInView } = useInView();

	// Runs again after each page, so a page the filters empty out still loads the next one.
	useEffect( () => {
		if ( isEndInView && hasMore && ! isLoadingMore && ! isLoadMoreError ) {
			onLoadMore?.();
		}
	}, [ isEndInView, hasMore, isLoadingMore, isLoadMoreError, onLoadMore ] );

	const listRef = useRef< HTMLDivElement >( null );
	const refocusRef = useRef( false );
	// The button goes away once a retry works or the last page loads, which would drop its focus.
	useEffect( () => {
		if ( ! refocusRef.current || isLoadingMore ) {
			return;
		}
		refocusRef.current = false;
		const { activeElement, body } = document;
		if ( ( ! hasMore || ! isLoadMoreError ) && ( ! activeElement || activeElement === body ) ) {
			listRef.current?.focus( { preventScroll: true } );
		}
	}, [ isLoadingMore, hasMore, isLoadMoreError ] );

	const emptyStates = {
		all: {
			title: translate( 'Conversations will appear here' ),
			description: translate(
				'Conversations on your posts and posts you follow or comment on appear here.'
			),
		},
		unread: {
			title: translate( 'You’re all caught up' ),
			description: translate( 'There are no new conversations.' ),
		},
		yours: {
			title: translate( 'You haven’t commented anywhere yet' ),
			description: translate( 'Comments you leave will appear here.' ),
		},
	};

	const sections = useMemo( () => {
		const today = moment().startOf( 'day' );
		const groups = [
			{ start: today, label: translate( 'Today' ) },
			{ start: today.clone().subtract( 1, 'day' ), label: translate( 'Yesterday' ) },
			{ start: today.clone().subtract( 6, 'days' ), label: translate( 'Older than 2 days' ) },
			{ start: today.clone().subtract( 30, 'days' ), label: translate( 'Older than a week' ) },
			{ start: moment( 0 ), label: translate( 'Older than a month' ) },
		];
		const result: { label: string; items: InboxItem[] }[] = [];
		// Your comments are dated by the comment but ordered by the conversation's latest one.
		if ( sort !== 'newest' || tab === 'yours' ) {
			return items.length ? [ { label: '', items } ] : result;
		}
		for ( const item of items ) {
			const { label } =
				groups.find( ( { start } ) => item.timestamp >= start.valueOf() ) ?? groups[ 4 ];
			const last = result[ result.length - 1 ];
			if ( last?.label === label ) {
				last.items.push( item );
			} else {
				result.push( { label, items: [ item ] } );
			}
		}
		return result;
	}, [ items, sort, tab, moment, translate ] );

	return (
		<VStack spacing={ 0 } className="conversations-inbox__list-pane">
			<HStack expanded={ false } className="conversations-inbox__pane-title">
				<Heading level={ 1 } size={ 20 } weight={ 500 } color="inherit">
					{ translate( 'Conversations' ) }
				</Heading>
				<KeyboardShortcuts isOpen={ isShortcutsOpen } onToggle={ onShortcutsToggle } />
			</HStack>
			<ConversationListTabs tab={ tab } unreadCount={ unreadCount } onChange={ onTabChange } />
			<ConversationListToolbar
				search={ search }
				onSearchChange={ onSearchChange }
				sort={ sort }
				onSortChange={ onSortChange }
				density={ density }
				onDensityChange={ onDensityChange }
			/>
			{ markAllCount > 0 && tab !== 'yours' && (
				<Button
					__next40pxDefaultSize
					variant="link"
					className="conversations-inbox__mark-read"
					onClick={ onMarkAllRead }
				>
					<span>
						{ translate(
							'Mark {{count}}%(count)s{{/count}} as read',
							'Mark {{count}}%(count)s{{/count}} as read',
							{
								count: markAllCount,
								args: { count: formatNumber( markAllCount ) },
								components: { count: <strong /> },
							}
						) }
					</span>
				</Button>
			) }
			<div
				ref={ listRef }
				tabIndex={ -1 }
				className={ clsx( 'conversations-inbox__list', `is-density-${ density }` ) }
			>
				{ isLoading && <Spinner /> }
				{ ! isLoading && isError && (
					<ListMessage
						title={ translate( 'Couldn’t load conversations' ) }
						description={ translate( 'Something went wrong while loading your conversations.' ) }
					>
						<Button __next40pxDefaultSize variant="secondary" onClick={ onRetry }>
							{ translate( 'Retry' ) }
						</Button>
					</ListMessage>
				) }
				{ ! isLoading && ! isError && items.length === 0 && ! hasMore && (
					<ListMessage
						{ ...( search.trim()
							? { description: translate( 'No conversations match your search.' ) }
							: emptyStates[ tab ] ) }
					/>
				) }
				{ sections.map( ( { label, items } ) => (
					<section key={ label }>
						{ label && (
							<Heading
								level={ 2 }
								size={ 14 }
								weight={ 500 }
								color="inherit"
								className="conversations-inbox__day"
							>
								{ label }
							</Heading>
						) }
						<ul>
							{ items.map( ( item ) => (
								<ConversationListItem
									key={ item.key }
									item={ item }
									isSelected={ item.key === selectedKey }
									openOnFocus={ openOnFocus }
									density={ density }
									onSelect={ onSelect }
								/>
							) ) }
						</ul>
					</section>
				) ) }
				{ ! isLoading && hasMore && (
					<div ref={ endRef } className="conversations-inbox__list-end">
						{ isLoadMoreError && (
							<ListMessage description={ translate( 'Couldn’t load more.' ) } />
						) }
						{ isLoadMoreError ? (
							// Stays mounted while loading so the focus isn't lost.
							<Button
								__next40pxDefaultSize
								variant="secondary"
								isBusy={ isLoadingMore }
								disabled={ isLoadingMore }
								accessibleWhenDisabled
								onClick={ () => {
									refocusRef.current = true;
									onLoadMore?.();
								} }
							>
								{ translate( 'Retry' ) }
							</Button>
						) : (
							isLoadingMore && <Spinner />
						) }
					</div>
				) }
			</div>
		</VStack>
	);
}

function ListMessage( {
	title,
	description,
	children,
}: {
	title?: string;
	description: string;
	children?: ReactNode;
} ) {
	return (
		<VStack spacing={ 3 } alignment="center" className="conversations-inbox__message">
			{ title && (
				<Heading level={ 2 } size={ 15 } weight={ 600 } color="inherit">
					{ title }
				</Heading>
			) }
			<Text as="p" color="var(--color-text-subtle)">
				{ description }
			</Text>
			{ children }
		</VStack>
	);
}
