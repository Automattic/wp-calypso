/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';

export default function( props ) {
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
		</Stream>
	);
}
