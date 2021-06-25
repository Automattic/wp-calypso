/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { html } from '../indices-to-html';
import { p } from './functions';

export const CommentBlock = ( { block, meta } ) => (
	<div
		className={ classNames( 'wpnc__comment', {
			'comment-other': meta.ids.comment !== block.meta.ids.comment,
			'comment-self': meta.ids.comment === block.meta.ids.comment,
		} ) }
	>
		{ p( html( block ) ) }
	</div>
);

export default CommentBlock;
