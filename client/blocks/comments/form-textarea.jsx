/**
 * External dependencies
 */
import React from 'react';
import AsyncLoad from 'calypso/components/async-load';

import './form-textarea.scss';

const PostCommentFormTextarea = ( props ) => (
	<AsyncLoad
		require="isolated-editor"
		onSaveContent={ ( html ) => props.onChange( html ) }
		onError={ console.error }
		settings={ {
			iso: {
				moreMenu: false,
				blocks: {
					allowBlocks: [
						'core/paragraph',
						'core/heading',
						'core/image',
						'core/list',
						'core/code',
						'core/video',
						'core/table',
						'core/quote',
						'core/separator',
					],
				},
			},
		} }
	/>
);

export default PostCommentFormTextarea;
