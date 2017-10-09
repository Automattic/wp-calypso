/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import DocumentHead from 'components/data/document-head';
import ConversationsIntro from './intro';

export default function( props ) {
	const isInternalConversations = get( props, 'store.id' ) === 'conversations-a8c';
	return (
		<Stream
			postsStore={ props.store }
			key="conversations"
			shouldCombineCards={ false }
			className="conversations__stream"
			followSource="conversations"
			useCompactCards={ true }
			trackScrollPage={ props.trackScrollPage }
		>
			<DocumentHead title={ props.title } />
			<ConversationsIntro isInternalConversations={ isInternalConversations } />
		</Stream>
	);
}
