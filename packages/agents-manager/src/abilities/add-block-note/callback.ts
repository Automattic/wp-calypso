import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { isEditorPage } from '../../utils/is-editor-page';
import { getNoteIds, withFirstNoteId } from '../block-notes/note-metadata';
import type { AbilityResult } from '../types';

const MAX_TEXT_LENGTH = 2000;

export type NoteRecord = {
	post: number;
	content: string;
	status: 'hold';
	type: 'note';
	parent: number;
};

export interface AddBlockNoteIO {
	getPostId(): number | undefined;
	/** `null` means the block does not exist. */
	getBlockMetadata( clientId: string ): unknown | null;
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
	const { clientId, text } = input;
	const failed = __( 'I could not add the note.', __i18n_text_domain__ );
	const trimmed = ( text ?? '' ).trim();

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

	const postId = io.getPostId();

	if ( ! postId ) {
		return errorResult(
			failed,
			'The post has no id yet, so a note cannot be attached. Ask the user to save the post, then try again.'
		);
	}

	const threadId = getNoteIds( metadata )[ 0 ];
	const replied = threadId !== undefined;
	let saved: { id: number };

	try {
		saved = await io.saveNote( {
			post: postId,
			content: `${ io.prefix } ${ trimmed }`,
			status: 'hold',
			type: 'note',
			parent: threadId ?? 0,
		} );
	} catch ( error ) {
		return errorResult( failed, error instanceof Error ? error.message : String( error ) );
	}

	if ( ! replied ) {
		io.setBlockMetadata( clientId, withFirstNoteId( metadata, saved.id ) );
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
				...( replied
					? {}
					: {
							nextStep:
								'Tell the user to save the post so the note stays on the block. Unsaved posts lose the link between the block and its note.',
						} ),
			},
		},
		returnToAgent: true,
	};
}

type BlockEditorSelectors = {
	getBlock?: ( clientId: string ) => { attributes?: { metadata?: unknown } } | null;
};

type BlockEditorActions = {
	updateBlockAttributes?: ( clientId: string, attributes: object ) => void;
};

type CoreActions = {
	saveEntityRecord?: (
		kind: string,
		name: string,
		record: object,
		options: object
	) => Promise< { id: number } | undefined >;
};

type EditorSelectors = {
	getCurrentPostId?: () => number | string | undefined;
};

// Stores are reached by name so this adds no `@wordpress/*` dependency.
function getBlockMetadata( clientId: string ): unknown | null {
	const block = ( select( 'core/block-editor' ) as BlockEditorSelectors | undefined )?.getBlock?.(
		clientId
	);

	return block ? ( block.attributes?.metadata ?? {} ) : null;
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
			getPostId: () => Number( editor?.getCurrentPostId?.() ) || undefined,
			getBlockMetadata,
			saveNote,
			setBlockMetadata: ( clientId, metadata ) =>
				(
					dispatch( 'core/block-editor' ) as BlockEditorActions | undefined
				 )?.updateBlockAttributes?.( clientId, { metadata } ),
			prefix: __( 'AI review:', __i18n_text_domain__ ),
		},
		input
	);
}
