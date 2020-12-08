/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import Stream from 'calypso/reader/stream';
import DocumentHead from 'calypso/components/data/document-head';
import ConversationsIntro from './intro';
import ConversationsEmptyContent from 'calypso/blocks/conversations/empty';

/**
 * Style dependencies
 */
import './stream.scss';

export default function ( props ) {
	const isInternal = get( props, 'store.id' ) === 'conversations-a8c';
	const emptyContent = <ConversationsEmptyContent />;
	const intro = <ConversationsIntro isInternal={ isInternal } />;
	return (
		<Stream
			key="conversations"
			streamKey={ props.streamKey }
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
