import { resolveSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isEditorPage } from '../../utils/is-editor-page';
import { getNoteIds, noteText } from '../block-notes/note-metadata';
import type { AbilityResult } from '../types';

export type RawNote = {
	id: number;
	parent: number;
	status: string;
	author_name?: string;
	content?: unknown;
};

export type BlockNote = {
	id: number;
	clientIds: string[];
	status: 'open' | 'resolved';
	author: string;
	text: string;
	replies: { author: string; text: string }[];
};

export interface GetBlockNotesIO {
	getPostId(): number | undefined;
	getBlocksWithNoteIds(): { clientId: string; noteIds: number[] }[];
	fetchNotes( postId: number ): Promise< RawNote[] >;
}

function errorResult( message: string, error: string ): AbilityResult {
	return {
		result: { success: false, message, error },
		returnToAgent: true,
	};
}

/**
 * Read the notes on the open post, grouped into threads.
 * @param io Editor accessors, injected so the logic is testable without WordPress.
 */
export async function getBlockNotes( io: GetBlockNotesIO ): Promise< AbilityResult > {
	const postId = io.getPostId();

	if ( ! postId ) {
		return errorResult(
			__( 'I could not read the notes on this post.', __i18n_text_domain__ ),
			'The post has no id yet, so it has no notes. Ask the user to save the post, then try again.'
		);
	}

	let raw: RawNote[];

	try {
		raw = await io.fetchNotes( postId );
	} catch ( error ) {
		return errorResult(
			__( 'I could not read the notes on this post.', __i18n_text_domain__ ),
			error instanceof Error ? error.message : String( error )
		);
	}

	const blocks = io.getBlocksWithNoteIds();
	const author = ( note: RawNote ) => note.author_name ?? '';
	const notes: BlockNote[] = raw
		.filter( ( note ) => ! note.parent )
		.map( ( thread ) => ( {
			id: thread.id,
			clientIds: blocks
				.filter( ( block ) => block.noteIds.includes( thread.id ) )
				.map( ( block ) => block.clientId ),
			status: thread.status === 'approved' ? 'resolved' : 'open',
			author: author( thread ),
			text: noteText( thread.content ),
			replies: raw
				.filter( ( reply ) => reply.parent === thread.id )
				.map( ( reply ) => ( { author: author( reply ), text: noteText( reply.content ) } ) ),
		} ) );

	return {
		result: {
			success: true,
			message: __( 'I read the notes on this post.', __i18n_text_domain__ ),
			details: { notes },
		},
		returnToAgent: true,
	};
}

type BlockEditorSelectors = {
	getClientIdsWithDescendants?: () => string[];
	getBlockAttributes?: ( clientId: string ) => { metadata?: unknown } | null;
};

type EditorSelectors = {
	getCurrentPostId?: () => number | string | undefined;
};

type CoreResolvers = {
	getEntityRecords?: ( kind: string, name: string, query: object ) => Promise< RawNote[] | null >;
};

// Stores are reached by name so this adds no `@wordpress/*` dependency.
function getBlocksWithNoteIds() {
	const editor = select( 'core/block-editor' ) as BlockEditorSelectors | undefined;
	const blocks: { clientId: string; noteIds: number[] }[] = [];

	for ( const clientId of editor?.getClientIdsWithDescendants?.() ?? [] ) {
		const noteIds = getNoteIds( editor?.getBlockAttributes?.( clientId )?.metadata );
		if ( noteIds.length ) {
			blocks.push( { clientId, noteIds } );
		}
	}

	return blocks;
}

async function fetchNotes( postId: number ): Promise< RawNote[] > {
	const core = resolveSelect( 'core' ) as CoreResolvers | undefined;
	const records = await core?.getEntityRecords?.( 'root', 'comment', {
		post: postId,
		type: 'note',
		status: 'all',
		per_page: 100,
		context: 'edit',
	} );

	return records ?? [];
}

/**
 * The `get-block-notes` ability callback.
 */
export async function getBlockNotesCallback(): Promise< AbilityResult > {
	if ( ! isEditorPage() ) {
		return errorResult(
			__( 'I can only read notes from the editor.', __i18n_text_domain__ ),
			'The editor is not open, so there is no post whose notes can be read.'
		);
	}

	const editor = select( 'core/editor' ) as EditorSelectors | undefined;

	return getBlockNotes( {
		getPostId: () => Number( editor?.getCurrentPostId?.() ) || undefined,
		getBlocksWithNoteIds,
		fetchNotes,
	} );
}
