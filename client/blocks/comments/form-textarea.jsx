/**
 * External dependencies
 */
import React from 'react';

import IsolatedBlockEditor from 'isolated-editor';

const PostCommentFormTextarea = ( props ) => (
	<IsolatedBlockEditor
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
