import page from '@automattic/calypso-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useCommentNotes, useMarkNotesRead } from 'calypso/reader/data/notifications';
import { ConversationDetail } from './conversation-detail';
import { ConversationList } from './conversation-list';
import { getConversationKey, groupNotesByPost, type Conversation } from './group-notes';

import './style.scss';

interface Props {
	siteId?: string;
	postId?: string;
}

const getConversationPath = ( { siteId, postId }: Pick< Conversation, 'siteId' | 'postId' > ) =>
	`/reader/conversations/inbox/${ siteId }/${ postId }`;

export function ConversationsInbox( { siteId, postId }: Props ) {
	const translate = useTranslate();
	const { data: notes = [], isLoading } = useCommentNotes();
	const { mutate: markRead } = useMarkNotesRead();

	const conversations = useMemo( () => groupNotesByPost( notes ), [ notes ] );
	const selectedKey = siteId && postId ? getConversationKey( siteId, postId ) : undefined;
	const selectedIndex = conversations.findIndex( ( { key } ) => key === selectedKey );
	const selected = selectedIndex >= 0 ? conversations[ selectedIndex ] : undefined;

	useEffect( () => {
		if ( ! selectedKey && conversations.length ) {
			page.replace( getConversationPath( conversations[ 0 ] ) );
		}
	}, [ selectedKey, conversations ] );

	const openConversation = ( conversation: Conversation ) => {
		if ( conversation.unreadNoteIds.length ) {
			markRead( conversation.unreadNoteIds );
		}
		page.show( getConversationPath( conversation ) );
	};

	const goTo = ( index: number ) => {
		const target = conversations[ index ];
		return target ? () => openConversation( target ) : undefined;
	};

	return (
		<ReaderMain className="conversations-inbox-main no-padding" wideLayout>
			<DocumentHead title={ translate( 'Conversations' ) } />
			<HStack spacing={ 0 } alignment="stretch" className="conversations-inbox">
				<ConversationList
					conversations={ conversations }
					isLoading={ isLoading }
					selectedKey={ selectedKey }
					onSelect={ openConversation }
				/>
				{ siteId && postId && (
					<ConversationDetail
						siteId={ Number( siteId ) }
						postId={ Number( postId ) }
						conversation={ selected }
						onPrevious={ selectedIndex > 0 ? goTo( selectedIndex - 1 ) : undefined }
						onNext={ selectedIndex >= 0 ? goTo( selectedIndex + 1 ) : undefined }
					/>
				) }
			</HStack>
		</ReaderMain>
	);
}
