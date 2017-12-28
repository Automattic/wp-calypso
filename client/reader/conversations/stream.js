/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Stream from 'client/reader/stream';
import DocumentHead from 'client/components/data/document-head';
import ConversationsIntro from './intro';
import ConversationsEmptyContent from 'client/blocks/conversations/empty';

export default function( props ) {
	const isInternal = get( props, 'store.id' ) === 'conversations-a8c';
	const emptyContent = <ConversationsEmptyContent />;
	const intro = <ConversationsIntro isInternal={ isInternal } />;
	return (
		<Stream
			postsStore={ props.store }
			key="conversations"
			shouldCombineCards={ false }
			className="conversations__stream"
			followSource="conversations"
			useCompactCards={ true }
			trackScrollPage={ props.trackScrollPage }
			emptyContent={ emptyContent }
			intro={ intro }
		>
			<DocumentHead title={ props.title } />
		</Stream>
	);
}
