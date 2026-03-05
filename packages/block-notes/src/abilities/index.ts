import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
import { select } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { getBlockNoteThreadSessionId } from '../utils/session';
import { trackBlockNoteAiReplyCreated, trackBlockNoteAiReplyFailed } from '../utils/tracking';
import { getBlockNotes, replyToNote } from './utils';
import type { ConvertedNote } from './utils';

export const ABILITY_NAME = 'big-sky/block-notes';

let isRegistered = false;

export { getBlockNotes, replyToNote, convertEntityNoteFormat } from './utils';

/**
 * Block notes ability callback type
 */
export type BlockNotesCallback = ( args: {
	operation: 'get' | 'reply';
	blockNoteId: number;
	notes?: string;
	summary?: string;
} ) => Promise< {
	success?: boolean;
	result?: string;
	notes?: ConvertedNote[];
	note?: ConvertedNote;
	message?: string;
	error?: string;
	returnToAgent: boolean;
} >;

/**
 * Register the block notes ability with WordPress Abilities API
 */
export async function registerBlockNotesAbility(): Promise< void > {
	// Prevent duplicate registration
	if ( isRegistered ) {
		return;
	}
	try {
		try {
			await registerAbilityCategory( 'big-sky', {
				label: 'Big Sky',
				description: 'Big Sky abilities for WordPress',
			} );
		} catch ( categoryError ) {
			// Ignore "already registered" errors so we can safely re-use the category.
			const message = ( categoryError as Error )?.message || '';
			if ( ! message.includes( 'already registered' ) ) {
				throw categoryError;
			}
		}

		await registerAbility( {
			name: ABILITY_NAME,
			label: 'Block Notes',
			category: 'big-sky',
			description:
				'Ability to view and reply to notes on specific blocks. Use this ability to provide contextual notes, suggestions, feedback, reviews, answers, or recommendations about block content. IMPORTANT: This ability is for communication only - it does NOT allow you to edit or modify block content directly. Use it to share your analysis, suggestions, or answer questions, but always clarify that you cannot make direct changes to the content unless another ability is available for that purpose.',
			input_schema: {
				type: 'object',
				properties: {
					operation: {
						type: 'string',
						enum: [ 'get', 'reply' ],
						description:
							'The note action to perform. Required fields by operation:\n' +
							'- "get": requires blockNoteId\n' +
							'- "reply": requires blockNoteId and notes',
					},
					blockNoteId: {
						type: 'number',
						description:
							'REQUIRED for "get" and "reply" operations. This is the blockNoteId attribute from the block. It corresponds to the note_ID of the top-level block note in the wp_comments table.',
					},
					notes: {
						type: 'string',
						description:
							'REQUIRED for "reply" operation. The agent will provide the response text of the note in this field.',
					},
					summary: {
						type: 'string',
						description:
							'Optional. A brief summary of the note operations performed or the main points of your feedback.',
					},
				},
				required: [ 'operation', 'blockNoteId' ],
			},
			callback: async ( input ) => {
				// Helper function to extract text content from notes or summary
				const extractNoteText = ( notesInput?: string, summaryText?: string ): string | null => {
					// If notesInput is a non-empty string, return it
					if ( typeof notesInput === 'string' && notesInput.trim() ) {
						return notesInput.trim();
					}

					// Fall back to summary if notes are not available or empty
					if ( typeof summaryText === 'string' && summaryText.trim() ) {
						return summaryText.trim();
					}

					return null;
				};
				let postId: number | undefined;

				try {
					postId = select( editorStore ).getCurrentPostId() ?? undefined;

					// Validate postId
					if ( ! postId ) {
						return {
							success: false,
							error: 'Unable to get current post ID',
							returnToAgent: true,
						};
					}

					if ( input.operation === 'get' ) {
						if ( ! input.blockNoteId ) {
							return {
								success: true,
								result: 'No existing note thread found for this block',
								notes: [],
								returnToAgent: true,
							};
						}

						const notes = await getBlockNotes( postId, input.blockNoteId );
						return {
							success: true,
							notes: notes || [],
							returnToAgent: true,
						};
					}

					if ( input.operation === 'reply' ) {
						const replyText = extractNoteText( input.notes, input.summary );

						if ( ! replyText ) {
							return {
								success: false,
								error:
									'Reply text is required but was empty or missing. Please provide your response content.',
								returnToAgent: true,
							};
						}

						if ( ! input.blockNoteId ) {
							return {
								success: false,
								error: 'blockNoteId is required for reply operation',
								returnToAgent: true,
							};
						}

						const note = await replyToNote(
							postId,
							input.blockNoteId,
							replyText,
							'AI [experimental]'
						);

						// Generate thread-specific session ID for tracking
						const threadSessionId = await getBlockNoteThreadSessionId( postId, input.blockNoteId );

						// Track successful AI reply creation
						trackBlockNoteAiReplyCreated( {
							noteId: note.note_ID,
							postId,
							parentNoteId: note.note_parent,
							sessionId: threadSessionId,
						} );

						return {
							success: true,
							note,
							message: 'Reply posted successfully',
							returnToAgent: true,
						};
					}

					// Handle invalid operation
					return {
						success: false,
						error: `Invalid operation: ${ input.operation }. Valid operations are: get, reply`,
						returnToAgent: true,
					};
				} catch ( error ) {
					if ( input.operation === 'reply' ) {
						// Generate thread-specific session ID for tracking
						const threadSessionId = await getBlockNoteThreadSessionId( postId, input.blockNoteId );

						trackBlockNoteAiReplyFailed( {
							noteId: input.blockNoteId,
							postId,
							errorType: 'ability_failed',
							sessionId: threadSessionId,
						} );
					}
					window.console?.error( 'Block Notes: Ability execution failed', error );
					return {
						success: false,
						error: `Failed to perform note action: ${
							( error as Error ).message || 'Unknown error occurred'
						}`,
						returnToAgent: true,
					};
				}
			},
		} );
		isRegistered = true;
	} catch ( error ) {
		// Ignore if already registered
		if ( error instanceof Error && error.message.includes( 'already registered' ) ) {
			isRegistered = true;
			return;
		}
		throw error;
	}
}
