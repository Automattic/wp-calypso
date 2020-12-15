/**
 * External dependencies
 */
import React from 'react';

import IsolatedBlockEditor from 'isolated-editor';

/**
 * Internal dependencies
 */
import FormTextarea from 'calypso/components/forms/form-textarea';
import withUserMentions from 'calypso/blocks/user-mentions/index';
import withPasteToLink from 'calypso/lib/paste-to-link';

/* eslint-disable jsx-a11y/no-autofocus */
const PostCommentFormTextarea = ( props ) => (
	<IsolatedBlockEditor
		onSaveContent={ ( html ) => props.onChange( html ) }
		onLoad={ ( parse ) => {} }
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
					],
				},
			},
		} }
	/>
);
/* eslint-enable jsx-a11y/no-autofocus */

export default withUserMentions( withPasteToLink( PostCommentFormTextarea ) );
