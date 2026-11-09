import { formatNumber } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { Tabs } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

export type InboxTab = 'all' | 'unread' | 'yours';

export const INBOX_TABS: InboxTab[] = [ 'all', 'unread', 'yours' ];

interface Props {
	tab: InboxTab;
	unreadCount: number;
	onChange: ( tab: InboxTab ) => void;
	children: ReactNode;
}

export function ConversationListTabs( { tab, unreadCount, onChange, children }: Props ) {
	const translate = useTranslate();

	const tabs: { name: InboxTab; label: string; count?: number }[] = [
		{ name: 'all', label: translate( 'All' ) },
		{ name: 'unread', label: translate( 'Unread' ), count: unreadCount },
		{ name: 'yours', label: translate( 'Your comments' ) },
	];

	return (
		<Tabs.Root
			value={ tab }
			onValueChange={ ( value ) => onChange( value as InboxTab ) }
			className="conversations-inbox__tabs-root"
		>
			<div className="conversations-inbox__tabs">
				<Tabs.List variant="minimal" className="conversations-inbox__tab-list">
					{ tabs.map( ( { name, label, count } ) => (
						<Tabs.Tab key={ name } value={ name }>
							<HStack as="span" spacing={ 1.5 } expanded={ false }>
								<span>{ label }</span>
								{ !! count && (
									<span className="conversations-inbox__badge">{ formatNumber( count ) }</span>
								) }
							</HStack>
						</Tabs.Tab>
					) ) }
				</Tabs.List>
			</div>
			{ INBOX_TABS.map( ( name ) => (
				<Tabs.Panel key={ name } value={ name } className="conversations-inbox__tab-panel">
					{ tab === name && children }
				</Tabs.Panel>
			) ) }
		</Tabs.Root>
	);
}
