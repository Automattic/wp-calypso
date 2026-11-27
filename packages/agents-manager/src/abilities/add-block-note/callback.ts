import { dispatch, resolveSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isEditorPage } from '../../utils/is-editor-page';
import {
	getNoteIds,
	noteBlockRefusal,
	toPostRef,
	withFirstNoteId,
} from '../block-notes/note-metadata';
import type { PostRef } from '../block-notes/note-metadata';
import type { AbilityResult } from '../types';

const MAX_TEXT_LENGTH = 2000;

const escapeText = ( text: string ) =>
	text.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );

export type NoteRecord = {
	post: number;
	content: string;
	status: 'hold';
	type: 'note';
	parent: number;
	meta?: { _wp_note_status: 'reopen' };
};

export interface AddBlockNoteIO {
	getPostId(): PostRef;
	/** `null` means the block does not exist. */
	getBlockMetadata( clientId: string ): unknown | null;
	/** A reason the block cannot take a note, or `null`. */
	getNoteBlockRefusal( clientId: string ): string | null;
	getNoteStatus( id: number ): Promise< 'open' | 'resolved' | 'missing' >;
	reopenNote( id: number ): Promise< void >;
	saveNote( record: NoteRecord ): Promise< { id: number } >;
	setBlockMetadata( clientId: string, metadata: Record< string, unknown > ): void;
	/** Translated "AI review:" label that starts every note. */
	prefix: string;
}

export type AddBlockNoteInput = { clientId: string; text: string };

function errorResult( message: string, error: string ): AbilityResult {
	return {
		result: { success: false, message, error },
		returnToAgent: true,
	};
}

/**
 * Leave a note on a block, or reply to the note it already has.
 * @param io Editor accessors, injected so the logic is testable without WordPress.
 * @param input The block client id and the note text.
 */
export async function addBlockNote(
	io: AddBlockNoteIO,
	input: AddBlockNoteInput
): Promise< AbilityResult > {
	const { clientId, text } = input ?? ( {} as AddBlockNoteInput );
	const failed = __( 'I could not add the note.', __i18n_text_domain__ );

	if ( typeof text !== 'string' || typeof clientId !== 'string' ) {
		return errorResult(
			failed,
			'The clientId and the text must both be strings. Check the input, then try again.'
		);
	}

	const trimmed = text.trim();

	if ( ! trimmed || trimmed.length > MAX_TEXT_LENGTH ) {
		return errorResult(
			failed,
			`The note text must be between 1 and ${ MAX_TEXT_LENGTH } characters. Shorten or fill in the text, then try again.`
		);
	}

	const metadata = io.getBlockMetadata( clientId );

	if ( metadata === null ) {
		return errorResult(
			failed,
			'No block has that client id. Read the post blocks again to get a current client id, then try again.'
		);
	}

	const refusal = io.getNoteBlockRefusal( clientId );

	if ( refusal ) {
		return errorResult( failed, refusal );
	}

	const postId = io.getPostId();

	if ( postId === 'unsupported' ) {
		return errorResult( failed, 'Notes work only on posts and pages.' );
	}

	if ( ! postId || postId === 'auto-draft' ) {
		return errorResult(
			failed,
			'The post has no id yet, so a note cannot be attached. Ask the user to save the post, then try again.'
		);
	}

	const noteIds = getNoteIds( metadata );
	let statuses: ( 'open' | 'resolved' | 'missing' )[];

	try {
		statuses = await Promise.all( noteIds.map( ( id ) => io.getNoteStatus( id ) ) );
	} catch ( error ) {
		return errorResult( failed, error instanceof Error ? error.message : String( error ) );
	}

	const openIndex = statuses.indexOf( 'open' );
	const resolvedIndex = statuses.indexOf( 'resolved' );
	const reopened = openIndex === -1 && resolvedIndex !== -1;
	const threadId = noteIds[ openIndex !== -1 ? openIndex : resolvedIndex ] as number | undefined;
	const replied = threadId !== undefined;
	let saved: { id: number };

	try {
		if ( reopened && threadId !== undefined ) {
			await io.reopenNote( threadId );
		}

		saved = await io.saveNote( {
			post: postId,
			content: `${ io.prefix } ${ escapeText( trimmed ) }`,
			status: 'hold',
			type: 'note',
			parent: threadId ?? 0,
			...( reopened ? { meta: { _wp_note_status: 'reopen' as const } } : {} ),
		} );
	} catch ( error ) {
		return errorResult( failed, error instanceof Error ? error.message : String( error ) );
	}

	let linked = true;

	if ( ! replied ) {
		try {
			const fresh = io.getBlockMetadata( clientId );

			if ( fresh === null ) {
				linked = false;
			} else {
				io.setBlockMetadata( clientId, withFirstNoteId( fresh, saved.id ) );
			}
		} catch ( error ) {
			return errorResult(
				failed,
				`The note was saved (note id ${ saved.id }) but could not be linked to the block: ${
					error instanceof Error ? error.message : String( error )
				}`
			);
		}
	}

	return {
		result: {
			success: true,
			message: replied
				? __( 'I replied to the note on that block.', __i18n_text_domain__ )
				: __( 'I added a note to that block.', __i18n_text_domain__ ),
			details: {
				noteId: saved.id,
				threadId: replied ? threadId : saved.id,
				replied,
				...( reopened ? { reopened: true } : {} ),
				...( linked ? {} : { linked: false } ),
				...( replied
					? {}
					: {
							nextStep: linked
								? 'Tell the user to save the post so the note stays on the block. Unsaved posts lose the link between the block and its note.'
								: 'The note was saved, but the block was removed before it could be linked, so the note is not attached to any block. Tell the user.',
						} ),
			},
		},
		returnToAgent: true,
	};
}

type BlockEditorSelectors = {
	getBlock?: ( clientId: string ) => { name?: string; attributes?: { metadata?: unknown } } | null;
	getBlockEditingMode?: ( clientId: string ) => string;
	getBlockParentsByBlockName?: ( clientId: string, names: string[] ) => string[];
};

type BlockEditorActions = {
	updateBlockAttributes?: ( clientId: string, attributes: object ) => void;
	__unstableMarkNextChangeAsNotPersistent?: () => void;
};

type CoreActions = {
	saveEntityRecord?: (
		kind: string,
		name: string,
		record: object,
		options: object
	) => Promise< { id: number } | undefined >;
};

type CoreSelectors = {
	getEntityRecord?: (
		kind: string,
		name: string,
		id: number,
		query: object
	) => Promise< { status?: string } | null | undefined >;
};

type EditorSelectors = {
	getCurrentPostId?: () => number | string | undefined;
	getCurrentPostAttribute?: ( name: string ) => unknown;
};

// Stores are reached by name so this adds no `@wordpress/*` dependency.
function getBlockMetadata( clientId: string ): unknown | null {
	const block = ( select( 'core/block-editor' ) as BlockEditorSelectors | undefined )?.getBlock?.(
		clientId
	);

	return block ? ( block.attributes?.metadata ?? {} ) : null;
}

function getNoteBlockRefusal( clientId: string ): string | null {
	const editor = select( 'core/block-editor' ) as BlockEditorSelectors | undefined;

	return noteBlockRefusal( {
		name: editor?.getBlock?.( clientId )?.name,
		editingMode: editor?.getBlockEditingMode?.( clientId ),
		hasReusableParent:
			( editor?.getBlockParentsByBlockName?.( clientId, [ 'core/template-part', 'core/block' ] )
				.length ?? 0 ) > 0,
	} );
}

async function getNoteStatus( id: number ): Promise< 'open' | 'resolved' | 'missing' > {
	try {
		const record = await (
			resolveSelect( 'core' ) as CoreSelectors | undefined
		 )?.getEntityRecord?.( 'root', 'comment', id, { context: 'edit' } );

		if ( record?.status === 'hold' ) {
			return 'open';
		}

		return record?.status === 'approved' ? 'resolved' : 'missing';
	} catch {
		return 'missing';
	}
}

async function reopenNote( id: number ): Promise< void > {
	await ( dispatch( 'core' ) as CoreActions | undefined )?.saveEntityRecord?.(
		'root',
		'comment',
		{ id, status: 'hold' },
		{ throwOnError: true }
	);
}

function setBlockMetadata( clientId: string, metadata: Record< string, unknown > ): void {
	const actions = dispatch( 'core/block-editor' ) as BlockEditorActions | undefined;

	if ( ! actions?.updateBlockAttributes ) {
		throw new Error( 'The block editor is not available to link the note.' );
	}

	// Keeps undo from dropping the link, as core does.
	actions.__unstableMarkNextChangeAsNotPersistent?.();
	actions.updateBlockAttributes( clientId, { metadata } );
}

async function saveNote( record: NoteRecord ): Promise< { id: number } > {
	const saved = await ( dispatch( 'core' ) as CoreActions | undefined )?.saveEntityRecord?.(
		'root',
		'comment',
		record,
		{ throwOnError: true }
	);

	if ( ! saved?.id ) {
		throw new Error( 'The note was not saved.' );
	}

	return saved;
}

/**
 * The `add-block-note` ability callback.
 * @param input The block client id and the note text.
 */
export async function addBlockNoteCallback( input: AddBlockNoteInput ): Promise< AbilityResult > {
	if ( ! isEditorPage() ) {
		return errorResult(
			__( 'I can only add notes in the editor.', __i18n_text_domain__ ),
			'The editor is not open, so there is no post to attach a note to.'
		);
	}

	const editor = select( 'core/editor' ) as EditorSelectors | undefined;

	return addBlockNote(
		{
			getPostId: () =>
				toPostRef( editor?.getCurrentPostId?.(), editor?.getCurrentPostAttribute?.( 'status' ) ),
			getBlockMetadata,
			getNoteBlockRefusal,
			getNoteStatus,
			reopenNote,
			saveNote,
			setBlockMetadata,
			prefix: __( 'AI review:', __i18n_text_domain__ ),
		},
		input
	);
}
