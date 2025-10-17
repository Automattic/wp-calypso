import clsx from 'clsx';
import { html } from '../../panel/indices-to-html';
import { p } from '../../panel/templates/functions';

export const CommentBlock = ( { block, meta } ) => (
	<div
		className={ clsx( 'wpnc__comment', {
			'comment-other': meta.ids.comment !== block.meta.ids.comment,
			'comment-self': meta.ids.comment === block.meta.ids.comment,
		} ) }
	>
		{ p( html( block ) ) }
	</div>
);

export default CommentBlock;
