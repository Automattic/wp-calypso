import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

export type InboxTab = 'all' | 'unread' | 'yours';

export const INBOX_TABS: InboxTab[] = [ 'all', 'unread', 'yours' ];

interface Props {
	tab: InboxTab;
	unreadCount: number;
	onChange: ( tab: InboxTab ) => void;
}

export function ConversationListTabs( { tab, unreadCount, onChange }: Props ) {
	const translate = useTranslate();

	const tabs: { name: InboxTab; label: string; count?: number }[] = [
		{ name: 'all', label: translate( 'All' ) },
		{ name: 'unread', label: translate( 'Unread' ), count: unreadCount },
		{ name: 'yours', label: translate( 'Your comments' ) },
	];

	return (
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
					onClick={ () => onChange( name ) }
				>
					<span>{ label }</span>
					{ !! count && <span className="conversations-inbox__badge">{ count }</span> }
				</HStack>
			) ) }
		</HStack>
	);
}
