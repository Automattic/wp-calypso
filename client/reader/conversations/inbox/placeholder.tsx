import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Skeleton from 'calypso/reader/components/skeleton';
import { ConversationDetailPlaceholder } from './conversation-detail/placeholder';
import { ConversationListPlaceholder } from './conversation-list/placeholder';
import { INBOX_TABS } from './conversation-list/tabs';
import { ConversationsInboxLayout, useInboxDensity, useIsNarrowInbox } from './layout';

import './placeholder.scss';
import './conversation-list/style.scss';

export function ConversationsInboxPlaceholder( { hasConversation }: { hasConversation: boolean } ) {
	const translate = useTranslate();
	const isNarrow = useIsNarrowInbox();
	const density = useInboxDensity();

	return (
		<ConversationsInboxLayout isNarrow={ isNarrow } hasConversation={ hasConversation }>
			<VStack spacing={ 0 } className="conversations-inbox__list-pane">
				<HStack expanded={ false } className="conversations-inbox__pane-title is-placeholder">
					<Heading level={ 1 } size={ 15 } lineHeight="20px" weight={ 600 } color="inherit">
						{ translate( 'Conversations' ) }
					</Heading>
				</HStack>
				<HStack
					spacing={ 6 }
					justify="flex-start"
					aria-hidden="true"
					className="conversations-inbox__tabs is-placeholder"
				>
					{ INBOX_TABS.map( ( tab ) => (
						<Skeleton key={ tab } height="16px" width="56px" />
					) ) }
				</HStack>
				<HStack aria-hidden="true" className="conversations-inbox__toolbar">
					<Skeleton height="32px" width="100%" />
				</HStack>
				<div className="conversations-inbox__list">
					<ConversationListPlaceholder density={ density } />
				</div>
			</VStack>
			{ ( ! isNarrow || hasConversation ) && <ConversationDetailPlaceholder /> }
		</ConversationsInboxLayout>
	);
}
