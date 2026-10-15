import { Button, SearchControl, Spinner } from '@wordpress/components';
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
	onMarkAllRead: ( noteIds: number[] ) => void;
}

export function ConversationList( {
	conversations,
	isLoading,
	selectedKey,
	onSelect,
	onMarkAllRead,
}: Props ) {
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
		<div className="conversations-inbox__list-pane">
			<h1 className="conversations-inbox__pane-title">{ translate( 'Conversations' ) }</h1>
			<div className="conversations-inbox__tabs" role="tablist">
				{ tabs.map( ( { name, label, count } ) => (
					<button
						key={ name }
						type="button"
						role="tab"
						aria-selected={ tab === name }
						className={ clsx( 'conversations-inbox__tab', { 'is-active': tab === name } ) }
						onClick={ () => setTab( name ) }
					>
						{ label }
						{ !! count && <span className="conversations-inbox__badge">{ count }</span> }
					</button>
				) ) }
			</div>
			<div className="conversations-inbox__toolbar">
				<SearchControl
					__nextHasNoMarginBottom
					value={ search }
					onChange={ setSearch }
					label={ translate( 'Search conversations' ) }
				/>
				<Button
					icon={ <Icon icon={ funnel } /> }
					label={ translate( 'Filters are coming soon' ) }
					showTooltip
					disabled
					accessibleWhenDisabled
				/>
				<Button
					icon={ <Icon icon={ cog } /> }
					label={ translate( 'Settings are coming soon' ) }
					showTooltip
					disabled
					accessibleWhenDisabled
				/>
			</div>
			{ unreadNoteIds.length > 0 && (
				<Button
					variant="link"
					className="conversations-inbox__mark-read"
					onClick={ () => onMarkAllRead( unreadNoteIds ) }
				>
					<span>
						{ translate( 'Mark {{b}}%(count)d{{/b}} as read', {
							args: { count: unreadNoteIds.length },
							components: { b: <strong /> },
						} ) }
					</span>
				</Button>
			) }
			<div className="conversations-inbox__list">
				{ isLoading && <Spinner /> }
				{ ! isLoading && visible.length === 0 && (
					<p className="conversations-inbox__empty">
						{ tab === 'yours'
							? translate( 'Conversations you commented on will show up here.' )
							: translate( 'No conversations yet.' ) }
					</p>
				) }
				{ sections.map( ( { label, items } ) => (
					<section key={ label }>
						<h2 className="conversations-inbox__day">{ label }</h2>
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
		</div>
	);
}
