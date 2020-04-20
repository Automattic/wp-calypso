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
import ConversationsEmptyContent from 'blocks/conversations/empty';

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
