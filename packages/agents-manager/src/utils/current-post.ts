import { dispatch, select } from '@wordpress/data';

// Resolved by name to keep `@wordpress/editor` out of the abilities chunk.
const EDITOR_STORE = 'core/editor';

/** The top-level post fields the pickers write. */
export type PostField = 'title' | 'excerpt';

/** The post the editor shows, with the requested fields as the editor holds them. */
export type EditedPost = { id: number | string; type: string } & Partial<
	Record< PostField, string >
>;

interface EditorSelect {
	getCurrentPostId?: () => number | string | null | undefined;
	getCurrentPostType?: () => string | undefined;
	getEditedPostAttribute?: ( attribute: string ) => unknown;
}

interface EditorDispatch {
	editPost?: ( edits: Record< string, unknown >, options: { undoIgnore: boolean } ) => void;
}

/**
 * Reads the post the editor shows and the given fields. An unset field reads
 * as `''`; an unreadable store, or an editor with no post, reads as
 * `undefined`, so a snapshot can tell "empty" from "unknown".
 */
export function readEditedPost( fields: PostField[] ): EditedPost | undefined {
	const editor = select( EDITOR_STORE ) as EditorSelect | undefined;
	const id = editor?.getCurrentPostId?.();
	const type = editor?.getCurrentPostType?.();
	if ( ! editor || ! id || ! type || ( fields.length && ! editor.getEditedPostAttribute ) ) {
		return undefined;
	}

	const post: EditedPost = { id, type };
	for ( const field of fields ) {
		const value = editor.getEditedPostAttribute?.( field );
		post[ field ] = typeof value === 'string' ? value : '';
	}

	return post;
}

/**
 * Writes post fields. Agent edits stay out of the editor's undo stack —
 * `restore-checkpoint` is the undo the agent offers.
 */
export function editCurrentPost( edits: Partial< Record< PostField, string > > ): void {
	const editor = dispatch( EDITOR_STORE ) as EditorDispatch | undefined;
	if ( ! editor?.editPost ) {
		throw new Error( 'The post is unavailable to edit.' );
	}

	editor.editPost( edits, { undoIgnore: true } );
}
