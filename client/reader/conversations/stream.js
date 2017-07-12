/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';

export default function( props ) {
	return (
		<Stream
			postsStore={ props.store }
			key="conversations"
			shouldCombineCards={ false }
			className="conversations__stream"
			followSource="conversations"
			trackScrollPage={ props.trackScrollPage }
		/>
	);
}
