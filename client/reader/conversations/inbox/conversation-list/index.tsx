import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	Icon,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { error as errorIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { KeyboardShortcuts } from '../keyboard-shortcuts';
import { ConversationListItem, type OpenSource } from './list-item';
import { ConversationListTabs, type InboxTab } from './tabs';
import { ConversationListToolbar, type Density, type SortOrder } from './toolbar';
import type { Conversation } from '../group-notes';

import './style.scss';

interface Props {
	conversations: Conversation[];
	unreadCount: number;
	isLoading: boolean;
	isError?: boolean;
	onRetry?: () => void;
	tab: InboxTab;
	onTabChange: ( tab: InboxTab ) => void;
	search: string;
	onSearchChange: ( search: string ) => void;
	density: Density;
	onDensityChange: ( density: Density ) => void;
	sort: SortOrder;
	onSortChange: ( sort: SortOrder ) => void;
	onMarkAllRead: () => void;
	isShortcutsOpen: boolean;
	onShortcutsToggle: ( isOpen: boolean ) => void;
	selectedKey?: string;
	onSelect: ( conversation: Conversation, source: OpenSource ) => void;
}

export function ConversationList( {
	conversations,
	unreadCount,
	isLoading,
	isError,
	onRetry,
	tab,
	onTabChange,
	search,
	onSearchChange,
	density,
	onDensityChange,
	sort,
	onSortChange,
	onMarkAllRead,
	isShortcutsOpen,
	onShortcutsToggle,
	selectedKey,
	onSelect,
}: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const sections = useMemo( () => {
		const today = moment().startOf( 'day' );
		const groups = [
			{ start: today, label: translate( 'Today' ) },
			{ start: today.clone().subtract( 1, 'day' ), label: translate( 'Yesterday' ) },
			{ start: today.clone().subtract( 6, 'days' ), label: translate( 'Older than 2 days' ) },
			{ start: today.clone().subtract( 30, 'days' ), label: translate( 'Older than a week' ) },
			{ start: moment( 0 ), label: translate( 'Older than a month' ) },
		];
		const result: { label: string; items: Conversation[] }[] = [];
		if ( sort !== 'newest_replies' ) {
			return conversations.length ? [ { label: '', items: conversations } ] : result;
		}
		for ( const conversation of conversations ) {
			const { label } =
				groups.find( ( { start } ) => conversation.timestamp >= start.valueOf() ) ?? groups[ 4 ];
			const last = result[ result.length - 1 ];
			if ( last?.label === label ) {
				last.items.push( conversation );
			} else {
				result.push( { label, items: [ conversation ] } );
			}
		}
		return result;
	}, [ conversations, sort, moment, translate ] );

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
			{ unreadCount > 0 && tab !== 'yours' && (
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
								count: unreadCount,
								args: { count: formatNumber( unreadCount ) },
								components: { count: <strong /> },
							}
						) }
					</span>
				</Button>
			) }
			<div className={ clsx( 'conversations-inbox__list', `is-density-${ density }` ) }>
				{ isLoading && <Spinner /> }
				{ ! isLoading && isError && (
					<VStack spacing={ 3 } alignment="center" className="conversations-inbox__state">
						<Icon icon={ errorIcon } className="conversations-inbox__state-icon is-error" />
						<Heading level={ 2 } size={ 15 } weight={ 600 } color="inherit">
							{ translate( 'Couldn’t load conversations' ) }
						</Heading>
						<Text as="p" color="var(--color-text-subtle)">
							{ translate( 'Something went wrong while loading your conversations.' ) }
						</Text>
						<Button __next40pxDefaultSize variant="secondary" onClick={ onRetry }>
							{ translate( 'Retry' ) }
						</Button>
					</VStack>
				) }
				{ ! isLoading && ! isError && conversations.length === 0 && (
					<EmptyState tab={ tab } isSearching={ !! search.trim() } />
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
							{ items.map( ( conversation ) => (
								<ConversationListItem
									key={ conversation.key }
									conversation={ conversation }
									isSelected={ conversation.key === selectedKey }
									density={ density }
									onSelect={ onSelect }
								/>
							) ) }
						</ul>
					</section>
				) ) }
			</div>
		</VStack>
	);
}

function EmptyState( { tab, isSearching }: { tab: InboxTab; isSearching: boolean } ) {
	const translate = useTranslate();

	if ( isSearching ) {
		return (
			<VStack alignment="center" className="conversations-inbox__state">
				<Text as="p" color="var(--color-text-subtle)">
					{ translate( 'No conversations match your search.' ) }
				</Text>
			</VStack>
		);
	}

	const { title, description } = {
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
	}[ tab ];

	return (
		<VStack spacing={ 2 } alignment="center" className="conversations-inbox__state">
			<Heading level={ 2 } size={ 15 } weight={ 600 } color="inherit">
				{ title }
			</Heading>
			<Text as="p" color="var(--color-text-subtle)">
				{ description }
			</Text>
		</VStack>
	);
}
