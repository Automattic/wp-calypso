import { serialize } from '@wordpress/blocks';
import { findPostContentClientId, getRootBlocks } from './editor-blocks';
import type { Block } from '@wordpress/blocks';

/**
 * The page body as block markup, from the live editor rather than the saved
 * `post_content`: the backend's page-design agent reads it to redesign the page
 * as it is, wrappers and image urls included. As in Big Sky, only the body of
 * a `core/post-content` block counts, so the post editor, whose body is the
 * document itself, sends none.
 */
export function getPageContentMarkup(): string {
	// Empty rather than thrown: a context read must never fail the turn.
	try {
		const postContentClientId = findPostContentClientId();
		const body = postContentClientId ? getRootBlocks( postContentClientId ) : [];

		return body.length ? serialize( body as Block[] ) : '';
	} catch {
		return '';
	}
}
