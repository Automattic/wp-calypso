import {
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { KeyboardShortcuts } from '../keyboard-shortcuts';
import { ConversationListItem } from './list-item';
import { ConversationListTabs, type InboxTab } from './tabs';
import { ConversationListToolbar } from './toolbar';
import type { Conversation } from '../group-notes';

import './style.scss';

interface Props {
	conversations: Conversation[];
	unreadCount: number;
	isLoading: boolean;
	tab: InboxTab;
	onTabChange: ( tab: InboxTab ) => void;
	search: string;
	onSearchChange: ( search: string ) => void;
	isShortcutsOpen: boolean;
	onShortcutsToggle: ( isOpen: boolean ) => void;
	selectedKey?: string;
	onSelect: ( conversation: Conversation ) => void;
}

export function ConversationList( {
	conversations,
	unreadCount,
	isLoading,
	tab,
	onTabChange,
	search,
	onSearchChange,
	isShortcutsOpen,
	onShortcutsToggle,
	selectedKey,
	onSelect,
}: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const sections = useMemo( () => {
		const result: { label: string; items: Conversation[] }[] = [];
		for ( const conversation of conversations ) {
			const day = moment( conversation.timestamp );
			let label = day.format( 'LL' );
			if ( day.isSame( moment(), 'day' ) ) {
				label = translate( 'Today' );
			} else if ( day.isSame( moment().subtract( 1, 'day' ), 'day' ) ) {
				label = translate( 'Yesterday' );
			}
			const last = result[ result.length - 1 ];
			if ( last?.label === label ) {
				last.items.push( conversation );
			} else {
				result.push( { label, items: [ conversation ] } );
			}
		}
		return result;
	}, [ conversations, moment, translate ] );

	return (
		<VStack spacing={ 0 } className="conversations-inbox__list-pane">
			<HStack expanded={ false } className="conversations-inbox__pane-title">
				<Heading level={ 1 } size={ 20 } weight={ 500 } color="inherit">
					{ translate( 'Conversations' ) }
				</Heading>
				<KeyboardShortcuts isOpen={ isShortcutsOpen } onToggle={ onShortcutsToggle } />
			</HStack>
			<ConversationListTabs tab={ tab } unreadCount={ unreadCount } onChange={ onTabChange } />
			<ConversationListToolbar search={ search } onSearchChange={ onSearchChange } />
			<div className="conversations-inbox__list">
				{ isLoading && <Spinner /> }
				{ ! isLoading && conversations.length === 0 && (
					<Text as="p" color="var(--color-text-subtle)" className="conversations-inbox__empty">
						{ tab === 'yours'
							? translate( 'Conversations you commented on will show up here.' )
							: translate( 'No conversations yet.' ) }
					</Text>
				) }
				{ sections.map( ( { label, items } ) => (
					<section key={ label }>
						<Heading
							level={ 2 }
							size={ 14 }
							weight={ 500 }
							color="inherit"
							className="conversations-inbox__day"
						>
							{ label }
						</Heading>
						<ul>
							{ items.map( ( conversation ) => (
								<ConversationListItem
									key={ conversation.key }
									conversation={ conversation }
									isSelected={ conversation.key === selectedKey }
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
