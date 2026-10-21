import {
	Button,
	SearchControl,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, cog, funnel } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { ConversationListItem } from './conversation-list-item';
import type { Conversation } from './group-notes';

export type InboxTab = 'all' | 'unread' | 'yours';

interface Props {
	conversations: Conversation[];
	isLoading: boolean;
	selectedKey?: string;
	onSelect: ( conversation: Conversation ) => void;
}

export function ConversationList( { conversations, isLoading, selectedKey, onSelect }: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const [ tab, setTab ] = useState< InboxTab >( 'all' );
	const [ search, setSearch ] = useState( '' );

	const unreadNoteIds = conversations.flatMap( ( { unreadNoteIds: ids } ) => ids );

	const visible = useMemo( () => {
		if ( tab === 'yours' ) {
			return [];
		}
		const term = search.trim().toLowerCase();
		return conversations.filter(
			( { unreadNoteIds: ids, title, excerpt } ) =>
				( tab === 'all' || ids.length > 0 ) &&
				( ! term || title.toLowerCase().includes( term ) || excerpt.toLowerCase().includes( term ) )
		);
	}, [ conversations, tab, search ] );

	const sections = useMemo( () => {
		const result: { label: string; items: Conversation[] }[] = [];
		for ( const conversation of visible ) {
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
	}, [ visible, moment, translate ] );

	const tabs: { name: InboxTab; label: string; count?: number }[] = [
		{ name: 'all', label: translate( 'All' ) },
		{ name: 'unread', label: translate( 'Unread' ), count: unreadNoteIds.length },
		{ name: 'yours', label: translate( 'Your comments' ) },
	];

	return (
		<VStack spacing={ 0 } className="conversations-inbox__list-pane">
			<Heading
				level={ 1 }
				size={ 20 }
				weight={ 500 }
				color="inherit"
				className="conversations-inbox__pane-title"
			>
				{ translate( 'Conversations' ) }
			</Heading>
			<HStack
				justify="flex-start"
				expanded={ false }
				className="conversations-inbox__tabs"
				role="tablist"
			>
				{ tabs.map( ( { name, label, count } ) => (
					<HStack
						as="button"
						key={ name }
						spacing={ 1.5 }
						justify="flex-start"
						expanded={ false }
						type="button"
						role="tab"
						aria-selected={ tab === name }
						className={ clsx( 'conversations-inbox__tab', { 'is-active': tab === name } ) }
						onClick={ () => setTab( name ) }
					>
						<span>{ label }</span>
						{ !! count && <span className="conversations-inbox__badge">{ count }</span> }
					</HStack>
				) ) }
			</HStack>
			<HStack spacing={ 1 } expanded={ false } className="conversations-inbox__toolbar">
				<SearchControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					value={ search }
					onChange={ setSearch }
					label={ translate( 'Search conversations' ) }
				/>
				<Button
					__next40pxDefaultSize
					icon={ <Icon icon={ funnel } /> }
					label={ translate( 'Filters are coming soon' ) }
					showTooltip
					disabled
					accessibleWhenDisabled
				/>
				<Button
					__next40pxDefaultSize
					icon={ <Icon icon={ cog } /> }
					label={ translate( 'Settings are coming soon' ) }
					showTooltip
					disabled
					accessibleWhenDisabled
				/>
			</HStack>
			<div className="conversations-inbox__list">
				{ isLoading && <Spinner /> }
				{ ! isLoading && visible.length === 0 && (
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
