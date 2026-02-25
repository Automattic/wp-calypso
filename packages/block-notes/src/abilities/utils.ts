import { store as coreStore } from '@wordpress/core-data';
import { dispatch, resolveSelect } from '@wordpress/data';

/**
 * Block notes utility functions
 *
 * This file contains pure utility functions for working with block notes.
 * These functions handle CRUD operations for block notes using WordPress data APIs.
 *
 * AI-specific logic and subscriptions are handled elsewhere:
 * - AI monitoring: src/block-notes/components/subscriptions/
 */

interface WPRestApiError extends Error {
	code?: string;
	data?: { status?: number };
}

/**
 * Note entity format from WordPress API
 */
export interface NoteEntity {
	id: number;
	post: number;
	author: number;
	author_name: string;
	author_email?: string;
	content:
		| {
				rendered?: string;
				raw?: string;
		  }
		| string;
	parent: number;
	type: string;
	status: string;
	date: string;
	date_gmt: string;
	meta?: Record< string, string >;
}

/**
 * Converted note format for internal use
 */
export interface ConvertedNote {
	note_ID: number;
	note_post_ID: number;
	note_author: string;
	note_content: string;
	note_parent: number;
	user_id: number;
	note_type: string;
	note_approved: number;
	note_date: string;
	note_date_gmt: string;
}

/**
 * Current user from WordPress API
 */
interface CurrentUser {
	id: number;
	name: string;
	email: string;
}

/**
 * Convert note from entities API format to expected format
 * @param note - Note object from entities API
 * @returns Note in expected format
 */
export const convertEntityNoteFormat = ( note: NoteEntity ): ConvertedNote => {
	return {
		note_ID: note.id,
		note_post_ID: note.post,
		note_author: note.author_name,
		note_content: typeof note.content === 'string' ? note.content : note.content?.rendered || '',
		note_parent: note.parent || 0,
		user_id: note.author,
		note_type: note.type,
		note_approved: note.status === 'approved' ? 1 : 0,
		note_date: note.date,
		note_date_gmt: note.date_gmt,
	};
};

/**
 * Get all notes for a specific block using noteId
 * @param postId - The post ID
 * @param noteId - The note ID from the block's noteId attribute
 * @returns Promise that resolves to the notes data
 */
export const getBlockNotes = async (
	postId: number,
	noteId: number
): Promise< ConvertedNote[] > => {
	try {
		const blockNotes: NoteEntity[] | null = await resolveSelect( coreStore ).getEntityRecords(
			'root',
			'comment',
			{
				post: postId,
				parent: noteId,
				type: 'note',
				status: 'any',
				context: 'edit',
				_locale: 'user',
			}
		);

		// Handle case where no notes exist yet
		if ( ! blockNotes ) {
			return [];
		}

		const blockNoteResponse = blockNotes.map( convertEntityNoteFormat );

		return blockNoteResponse;
	} catch ( error ) {
		window.console?.error( 'Block Notes: API error:', {
			message: ( error as Error ).message,
			code: ( error as WPRestApiError ).code,
			data: ( error as WPRestApiError ).data,
			postId,
			noteId,
		} );
		throw error;
	}
};

/**
 * Create a block note in the database
 * @param args            - Note creation arguments
 * @param args.postId
 * @param args.content
 * @param args.authorName
 * @param args.noteId
 * @returns Created note data
 */
const createBlockNoteInDB = async ( {
	postId,
	content,
	authorName,
	noteId,
}: {
	postId: number;
	content: string;
	authorName: string;
	noteId: number;
} ): Promise< ConvertedNote > => {
	try {
		const currentUser: CurrentUser | undefined = await resolveSelect( coreStore ).getCurrentUser();

		const noteData = {
			post: postId,
			content,
			type: 'note',
			parent: noteId,
			author: currentUser?.id,
			author_name: authorName || currentUser?.name,
			author_email: currentUser?.email,
			status: 'hold',
		};

		const newNote: NoteEntity = await dispatch( coreStore ).saveEntityRecord(
			'root',
			'comment',
			noteData
		);

		return convertEntityNoteFormat( newNote );
	} catch ( error ) {
		window.console?.error( '❌ Failed to create block note:', error );
		throw error;
	}
};

/**
 * Reply to an existing note
 * @param postId     - The post ID
 * @param noteId     - Block note ID from the block's noteId attribute
 * @param content    - The reply content
 * @param authorName - Optional author name
 * @returns Promise that resolves to the created reply data
 */
export const replyToNote = async (
	postId: number,
	noteId: number,
	content: string,
	authorName = ''
): Promise< ConvertedNote > => {
	try {
		const result = await createBlockNoteInDB( {
			postId,
			content,
			authorName,
			noteId,
		} );
		return result;
	} catch ( error ) {
		window.console?.error( 'Block Notes: Error in replyToNote:', error );
		throw error;
	}
};
