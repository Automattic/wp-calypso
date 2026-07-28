/**
 * Shared draft assist constraints.
 *
 * The editor entry point (`extensions/draft-entry.ts`) and the
 * `jetpack-ai/apply-draft-content` handler (`utils/apply-draft-content.ts`) must
 * agree on which editor entities draft assist may touch. The handler cannot
 * infer it from the entry point: the ability is registered for the whole editor
 * surface, and in the site editor `core/editor` serves templates and template
 * parts — where writing article prose would change the site, not a post.
 */

import type { DraftAssistContentType } from './tracking';

/** Editor post types draft assist applies to. */
export const DRAFT_ASSIST_POST_TYPES: readonly DraftAssistContentType[] = [ 'post', 'page' ];

/**
 * Whether draft assist may act on the given post type.
 * @param postType - Value from `core/editor`'s `getCurrentPostType()`.
 * @returns Whether the post type is one draft assist supports.
 */
export function isDraftAssistPostType( postType: unknown ): postType is DraftAssistContentType {
	return (
		typeof postType === 'string' &&
		( DRAFT_ASSIST_POST_TYPES as readonly string[] ).includes( postType )
	);
}
