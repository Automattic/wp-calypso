import { getAgentManager, useAgentChat } from '@automattic/agenttic-client';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useRegistry, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { convertEntityNoteFormat, replyToNote } from '../../abilities/utils';
import { blockNotesAgentConfig } from '../../agent-config';
import { useAgentConfig } from '../../hooks/use-agent-config';
import { store as aiStore } from '../../store';
import { hasAiMention } from '../../utils/content';
import { areBlockNotesEnabled } from '../../utils/feature-flag';
import { getBlockNoteThreadSessionId } from '../../utils/session';
import { trackBlockNoteAiResponseFailed, trackBlockNoteAtMentionUsed } from '../../utils/tracking';
import BlockNoteMentionAutocomplete from '../mention-autocomplete/index';
import BlockNoteThinkingIndicator from '../thinking-indicator/index';
import type { ConvertedNote, NoteEntity } from '../../abilities/utils';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';

/**
 * Maximum age in milliseconds for a note to be processed (1 minute)
 */
const NOTE_STALE_THRESHOLD_MS = 60 * 1000;

const DEFAULT_ERROR_MESSAGE = __(
	'Unfortunately, there was an error processing your request. Please try again later.',
	'big-sky'
);

/**
 * Mark a note as processed by adding meta data
 * @param {number}   noteId                 - The note ID to mark as processed
 * @param {Set}      processedNotesSet      - In-memory set of processed note IDs
 * @param {Function} editEntityRecord       - Function to edit entity record
 * @param {Function} saveEditedEntityRecord - Function to save edited entity record
 */
const markNoteAsProcessed = async (
	noteId: number,
	processedNotesSet: Set< number >,
	editEntityRecord: ( ...args: any[] ) => Promise< any >,
	saveEditedEntityRecord: ( ...args: any[] ) => Promise< any >
): Promise< void > => {
	try {
		const processedDate = new Date().toISOString();

		// Add to in-memory set immediately to prevent duplicate processing
		processedNotesSet.add( Number( noteId ) );

		await editEntityRecord( 'root', 'comment', noteId, {
			meta: {
				bigsky_ai_processed_date: processedDate,
			},
		} );

		await saveEditedEntityRecord( 'root', 'comment', noteId );
	} catch ( error ) {
		window.console?.error( `Block Notes: Error marking note ${ noteId } as processed:`, error );
		// If database operation fails, remove from memory set
		processedNotesSet.delete( Number( noteId ) );
		throw error;
	}
};

/**
 * Handle stale notes by tracking failures, marking as processed, and replying with error.
 * Only replies to the latest note per thread to avoid spamming.
 * @param {Object}   params                          - Parameters object
 * @param {Array}    params.notes                    - Array of stale note objects
 * @param {number}   params.postId                   - The current post ID
 * @param {Set}      params.processedNotesSet        - Set tracking processed note IDs
 * @param {Function} params.editEntityRecord         - Function to edit entity records
 * @param {Function} params.saveEditedEntityRecord   - Function to save edited entity records
 * @param {Function} params.addInProcessBlockNote    - Function to add note to in-process list
 * @param {Function} params.removeInProcessBlockNote - Function to remove note from in-process list
 */
const handleStaleNotes = ( {
	notes,
	postId,
	processedNotesSet,
	editEntityRecord,
	saveEditedEntityRecord,
	addInProcessBlockNote,
	removeInProcessBlockNote,
}: {
	notes: NoteEntity[];
	postId: number;
	processedNotesSet: Set< number >;
	editEntityRecord: ( ...args: any[] ) => Promise< any >;
	saveEditedEntityRecord: ( ...args: any[] ) => Promise< any >;
	addInProcessBlockNote: ( noteId: number, postId: number ) => void;
	removeInProcessBlockNote: ( noteId: number, postId: number ) => void;
} ): void => {
	// Transform notes, add to in-process list
	const { transformedNotes, latestNoteIdByThread } = notes.reduce(
		( acc, note ) => {
			const transformed = convertEntityNoteFormat( note );
			addInProcessBlockNote( transformed.note_ID, transformed.note_post_ID );
			acc.transformedNotes.push( transformed );

			const rootNoteId = transformed.note_parent || transformed.note_ID;
			if (
				! acc.latestNoteIdByThread[ rootNoteId ] ||
				transformed.note_ID > acc.latestNoteIdByThread[ rootNoteId ]
			) {
				acc.latestNoteIdByThread[ rootNoteId ] = transformed.note_ID;
			}
			return acc;
		},
		{
			transformedNotes: [] as ConvertedNote[],
			latestNoteIdByThread: {} as Record< number, number >,
		}
	);

	// Process all notes: track, mark as processed, and reply only to latest per thread
	transformedNotes.forEach( ( note: ConvertedNote ) => {
		const rootNoteId = note.note_parent || note.note_ID;
		const isLatestInThread = latestNoteIdByThread[ rootNoteId ] === note.note_ID;

		const processStaleNote = async () => {
			const threadSessionId = await getBlockNoteThreadSessionId( note.note_post_ID, rootNoteId );

			trackBlockNoteAiResponseFailed( {
				noteId: note.note_ID,
				postId,
				parentNoteId: note.note_parent,
				errorType: 'agent_response_failed',
				sessionId: threadSessionId,
			} );

			// Reply only to the latest note in each thread
			if ( isLatestInThread ) {
				await replyToNote(
					note.note_post_ID,
					rootNoteId,
					DEFAULT_ERROR_MESSAGE,
					'AI [Experimental]'
				);
			}

			await markNoteAsProcessed(
				note.note_ID,
				processedNotesSet,
				editEntityRecord,
				saveEditedEntityRecord
			);
		};

		processStaleNote()
			.then( () => {
				removeInProcessBlockNote( note.note_ID, note.note_post_ID );
			} )
			.catch( ( error ) => {
				window.console?.error(
					`Block Notes: Error processing stale note ID ${ note.note_ID }:`,
					error
				);
				removeInProcessBlockNote( note.note_ID, note.note_post_ID );
			} );
	} );
};

/**
 * Check if a note is stale (older than NOTE_STALE_THRESHOLD_MS)
 * @param {Object} note - The note object
 * @returns {boolean} True if note is stale, false if fresh or date_gmt is not present
 */
const isNoteStale = ( note: NoteEntity ): boolean => {
	if ( ! note.date_gmt ) {
		return false;
	}

	try {
		// Ensure the date string is treated as UTC by appending 'Z' if not present
		let dateString = note.date_gmt;
		if ( ! dateString.endsWith( 'Z' ) && ! /[+-]\d{2}:\d{2}$/.test( dateString ) ) {
			dateString = dateString + 'Z';
		}

		const noteDate = new Date( dateString );

		// Validate that the date is valid
		if ( isNaN( noteDate.getTime() ) ) {
			window.console?.error( 'Block Notes: Invalid date_gmt format:', note.date_gmt );
			return false;
		}

		const currentDate = new Date();
		const ageInMs = currentDate.getTime() - noteDate.getTime();

		return ageInMs > NOTE_STALE_THRESHOLD_MS;
	} catch ( error ) {
		window.console?.error( 'Block Notes: Error parsing note date_gmt:', error );
		return false;
	}
};

/**
 * Check if a comment has been processed by the AI
 * @param {Object} comment              - The comment object
 * @param {Set}    processedCommentsSet - In-memory set of processed comment IDs
 * @returns {boolean} True if already processed
 */
const isNoteProcessed = ( comment: NoteEntity, processedCommentsSet: Set< number > ): boolean => {
	// First check in-memory set for fast lookup
	if ( processedCommentsSet.has( Number( comment.id ) ) ) {
		return true;
	}

	// Then check database meta
	const meta = comment.meta || {};
	const processedDate = meta.bigsky_ai_processed_date;
	const isProcessed = !! processedDate && processedDate !== '';

	// If found in database, add to memory for future checks
	if ( isProcessed ) {
		processedCommentsSet.add( Number( comment.id ) );
	}

	return isProcessed;
};

/**
 * Build a lookup map of note IDs to block objects
 * This is more efficient than searching recursively for each note
 * @param {Object} registry - WordPress data registry
 * @returns {Object} Map of noteId -> block object
 */
const buildNoteToBlockMap = ( registry: any ): Record< number, any > => {
	const allBlocks = registry.select( blockEditorStore ).getBlocks();
	const map: Record< number, any > = {};

	// Recursively build map - only done once per batch
	const mapBlocks = ( blocks: any[] ): void => {
		for ( const block of blocks ) {
			if ( block.attributes?.metadata?.noteId ) {
				// Store the entire block object, not just clientId
				map[ block.attributes.metadata.noteId ] = block;
			}

			if ( block.innerBlocks?.length > 0 ) {
				mapBlocks( block.innerBlocks );
			}
		}
	};

	mapBlocks( allBlocks );
	return map;
};

/**
 * Extract readable content from a block based on its type
 * @param {Object} block - The block object
 * @returns {string|null} Readable content or null
 */
const extractBlockContent = ( block: any ): string | null => {
	if ( ! block?.attributes ) {
		return null;
	}

	const { name, attributes } = block;

	// Extract content based on common block types
	if ( name === 'core/paragraph' && attributes.content ) {
		return attributes.content;
	}
	if ( name === 'core/freeform' && attributes.content ) {
		return attributes.content;
	}
	if ( name === 'core/heading' && attributes.content ) {
		return attributes.content;
	}
	if ( name === 'core/list' && attributes.values ) {
		return attributes.values;
	}
	if ( name === 'core/quote' && attributes.value ) {
		return attributes.value;
	}
	if ( name === 'core/image' && attributes.alt ) {
		return `Image: ${ attributes.alt }`;
	}
	if ( name === 'core/button' && attributes.text ) {
		return `Button: ${ attributes.text }`;
	}

	return null;
};

/**
 * Build a contextual message with block and post information for the AI
 * This provides the AI with context but leaves replying to the agentic flow
 * @param {Object}      note        - The note object
 * @param {Object|null} block       - The associated block object (optional)
 * @param {Object}      currentPost - The current post object
 * @param {string}      postType    - The current post type
 * @returns {string} Enhanced message with context
 */
const buildContextMessage = (
	note: ConvertedNote,
	block: any = null,
	currentPost: any = null,
	postType: string = ''
): string => {
	const userMessage = note.note_content.replace( '@wordpress', '' ).trim();

	// Build structured context with clear sections
	let context = `A user has mentioned you in a block note.

User's Message:
"${ userMessage }"

`;

	// Post Context section
	context += 'Post Context:\n';
	if ( currentPost?.title ) {
		const postTitle =
			typeof currentPost.title === 'string'
				? currentPost.title
				: currentPost.title?.rendered || currentPost.title?.raw || '';
		context += `- Post Title: "${ postTitle }"\n`;
	}
	context += `- Post Type: ${ postType }\n`;
	context += `- Post ID: ${ note.note_post_ID }\n\n`;

	// Note Details section
	context += 'Note Details:\n';
	context += `- Note Author: ${ note.note_author }\n`;
	context += `- Note ID: ${ note.note_ID }\n`;
	context += `- Parent Note ID: ${ note.note_parent || 'None (this is a root note)' }\n\n`;

	// Block Context section (if available)
	if ( block ) {
		context += 'Block Context:\n';
		context += `- Block Type: ${ block.name }\n`;
		context += `- Block ID: ${ block.clientId }\n`;

		// Extract and display block content
		const blockContent = extractBlockContent( block );
		if ( blockContent ) {
			context += `- Block Content: "${ blockContent }"\n`;
		}

		// Display block attributes (with sensitive data filtered)
		if ( block.attributes && Object.keys( block.attributes ).length > 0 ) {
			const relevantAttributes = { ...block.attributes };
			// Remove potentially large or sensitive attributes
			delete relevantAttributes.content; // Already shown separately
			delete relevantAttributes.values; // Already shown separately
			delete relevantAttributes.className;
			delete relevantAttributes.lock;

			if ( Object.keys( relevantAttributes ).length > 0 ) {
				context += `- Block Attributes: ${ JSON.stringify( relevantAttributes, null, 2 ) }\n`;
			}
		}

		// Inner blocks information
		const hasInnerBlocks = block.innerBlocks && block.innerBlocks.length > 0;
		if ( hasInnerBlocks ) {
			const innerBlockCount = block.innerBlocks.length;
			const innerBlockTypes = block.innerBlocks.map( ( b: any ) => b.name ).join( ', ' );
			context += '- Has Inner Blocks: Yes\n';
			context += `- Inner Block Count: ${ innerBlockCount }\n`;
			context += `- Inner Block Types: ${ innerBlockTypes }\n`;
		} else {
			context += '- Has Inner Blocks: No\n';
		}

		context += '\n';
	}

	// Instructions section
	context += `Instructions:
1. First, use the 'big-sky/block-notes' ability with operation='get' and blockNoteId=${
		note.note_parent || note.note_ID
	} to gather context of the note thread
2. Analyze the user's message in the context of:
   - The page structure and post details
   - The block on which note is posted (if applicable)
   - The existing note thread
3. Provide helpful contextual notes, suggestions, feedback, reviews, answers, or recommendations about the content.
4. Use web_search tool to provide the most up-to-date information. Add inline citations using HTML anchor tags like <a href="URL" target="_blank" rel="noopener noreferrer">[1]</a>. Do not add sources at the end of your response.
5. Use the 'big-sky/block-notes' ability with operation='reply' and blockNoteId=${
		note.note_parent || note.note_ID
	} to respond to this note.

Important Constraints:
- You can ONLY provide suggestions and feedback through notes
- You CANNOT directly edit or modify the block content itself
- You MUST keep your response below 1000 characters
- You MUST NOT add follow-up suggestions, questions, or conversational text in your response.
- You CANNOT take any action on the site other than to provide suggestions and feedback through notes
- Always gather thread context before responding to ensure continuity`;
	return context;
};

/**
 * Process AI note detected in data store
 * This function triggers the wp-orchestrator agent - the AI will handle replying via the ability
 * @param {Object}             note                   - WordPress note object
 * @param {Function}           agentSubmit            - Function to submit message to wp-orchestrator agent
 * @param {Object}             noteToBlockMap         - Pre-built map of noteId -> block object
 * @param {Set}                processedNotesSet      - In-memory set of processed note IDs
 * @param {Function}           editEntityRecord       - Function to edit entity record
 * @param {Function}           saveEditedEntityRecord - Function to save edited entity record
 * @param {Object}             currentPost            - The current post object
 * @param {string}             postType               - The current post type
 * @param {string | undefined} threadSessionId        - The thread-specific session ID for tracking
 */
const processAiNote = async (
	note: ConvertedNote,
	agentSubmit: ( ...args: any[] ) => Promise< any >,
	noteToBlockMap: Record< number, any >,
	processedNotesSet: Set< number >,
	editEntityRecord: ( ...args: any[] ) => Promise< any >,
	saveEditedEntityRecord: ( ...args: any[] ) => Promise< any >,
	currentPost: any,
	postType: string,
	threadSessionId?: string
): Promise< void > => {
	// Look up the block from the pre-built map (O(1) lookup)
	const rootNoteId = note.note_parent || note.note_ID;
	const associatedBlock = noteToBlockMap[ rootNoteId ] || null;

	// Build context message for the AI with block information
	const contextMessage = buildContextMessage( note, associatedBlock, currentPost, postType );

	// Submit message to wp-orchestrator agent
	try {
		await agentSubmit( contextMessage, {
			type: 'context',
			sessionId: threadSessionId,
		} );
	} catch ( error ) {
		window.console?.error(
			`Block Notes: Error submitting note id ${ note.note_ID } to agent with error ${ error }.`
		);
		trackBlockNoteAiResponseFailed( {
			noteId: note.note_ID,
			postId: currentPost?.id,
			parentNoteId: note.note_parent,
			errorType: 'agent_response_failed',
			sessionId: threadSessionId,
		} );
		await replyToNote( note.note_post_ID, rootNoteId, DEFAULT_ERROR_MESSAGE, 'AI [Experimental]' );
	} finally {
		window.console?.info( `Block Notes: Marking note ID ${ note.note_ID } as processed.` );

		// Mark as processed in database and in-memory
		await markNoteAsProcessed(
			note.note_ID,
			processedNotesSet,
			editEntityRecord,
			saveEditedEntityRecord
		);
	}
};

/**
 * BlockNoteSubscriptionsChat Component
 *
 * Monitors block notes for @ai mentions and triggers the agentic flow.
 * This component follows the pattern of EditorSubscriptions and integrates with
 * the WordPress data layer to watch for new notes in real-time.
 * @param {Object} root0                  - Component props
 * @param {Object} root0.agentConfigState - Loaded agent configuration from wp-orchestrator
 */
function BlockNoteSubscriptionsChat( {
	agentConfigState,
}: {
	agentConfigState: UseAgentChatConfig;
} ) {
	const agentChatProps = useAgentChat( agentConfigState );
	const agentSubmit = agentChatProps.onSubmit;

	// In-memory set to track processed notes (persists across re-renders)
	const processedNotesRef = useRef( new Set< number >() );

	// Get registry for building block map
	const registry = useRegistry();

	const { currentPost, postType } = useSelect( ( select ) => {
		return {
			currentPost: select( editorStore ).getCurrentPost() as
				| {
						id?: number;
						title?: string | { rendered?: string; raw?: string };
				  }
				| undefined,
			postType: select( editorStore ).getCurrentPostType(),
		};
	}, [] );

	const currentPostId = currentPost?.id;

	const { currentUserId, blockNotes: blockNotes } = useSelect(
		( select ) => {
			const user = select( coreStore ).getCurrentUser();
			const userId = user?.id;

			if ( ! currentPostId || ! userId || ! areBlockNotesEnabled() ) {
				return { currentUserId: userId, blockNotes: null };
			}

			// Get block notes from entities API with meta data
			// Only fetch notes by current user since they're the only one who can mention @ai
			return {
				currentUserId: userId,
				blockNotes: select( coreStore ).getEntityRecords< NoteEntity >( 'root', 'comment', {
					post: currentPostId,
					author: userId,
					type: 'note',
					status: 'any',
					per_page: 100,
					context: 'edit',
					_locale: 'user',
					_fields: 'id,content,author,author_name,meta,parent,post,type,status,date,date_gmt',
				} ),
			};
		},
		[ currentPostId ]
	);

	const blockNotesBeingProcessed = useSelect(
		( select ) => {
			if ( ! currentPostId ) {
				return null;
			}
			return select( aiStore ).getInProcessBlockNotes( currentPostId );
		},
		[ currentPostId ]
	);

	const {
		addInProcessBlockNote: addInProcessBlockNote,
		removeInProcessBlockNote: removeInProcessBlockNote,
	} = useDispatch( aiStore );

	const { editEntityRecord, saveEditedEntityRecord } = useDispatch( coreStore );

	// Clear processed comments set when post changes to prevent memory leaks
	useEffect( () => {
		processedNotesRef.current.clear();
	}, [ currentPostId ] );

	useEffect( () => {
		// Don't process if we don't have the required data
		if ( ! currentPostId || ! currentUserId || ! blockNotes ) {
			return;
		}

		// Categorise notes addressed to AI that haven't been processed and aren't being processed
		const { staleNotes, messagesAddressedToAi } = blockNotes.reduce(
			( acc, note ) => {
				const hasAiMentionInNote = hasAiMention(
					typeof note.content === 'string' ? note.content : note.content?.rendered
				);

				const isAlreadyProcessed = isNoteProcessed( note, processedNotesRef.current );
				// Convert both to numbers for comparison to handle type mismatches
				const isBeingProcessed =
					blockNotesBeingProcessed &&
					Array.isArray( blockNotesBeingProcessed ) &&
					blockNotesBeingProcessed.some( ( id ) => Number( id ) === Number( note.id ) );

				if ( hasAiMentionInNote && ! isAlreadyProcessed && ! isBeingProcessed ) {
					if ( isNoteStale( note ) ) {
						acc.staleNotes.push( note );
					} else {
						acc.messagesAddressedToAi.push( note );
					}
				}

				return acc;
			},
			{
				staleNotes: [] as NoteEntity[],
				messagesAddressedToAi: [] as NoteEntity[],
			}
		);

		// Handle stale notes - reply with error and track failure
		if ( staleNotes.length > 0 ) {
			handleStaleNotes( {
				notes: staleNotes,
				postId: currentPostId,
				processedNotesSet: processedNotesRef.current,
				editEntityRecord,
				saveEditedEntityRecord,
				addInProcessBlockNote,
				removeInProcessBlockNote,
			} );
		}

		// Verify agent is registered before processing
		// This ensures the useAgentChat initialization useEffect has completed
		const agentManager = getAgentManager();
		const agentKey = agentConfigState?.agentId;
		if ( ! agentKey || ! agentManager.hasAgent( agentKey ) ) {
			return;
		}

		if ( messagesAddressedToAi.length > 0 ) {
			// Build the note-to-block map once for all notes in this batch
			// This is O(n) for n blocks, instead of O(n*m) for m comments
			const noteToBlockMap = buildNoteToBlockMap( registry );

			// Process each AI note using the pre-built map
			// Note: Not awaiting - processing happens asynchronously in background
			messagesAddressedToAi.forEach( async ( note: NoteEntity ) => {
				// Convert entities API format to expected format
				const transformedNote = convertEntityNoteFormat( note );

				// Calculate root note ID and generate thread-specific session ID
				const rootNoteId = transformedNote.note_parent || transformedNote.note_ID;

				const threadSessionId = await getBlockNoteThreadSessionId(
					transformedNote.note_post_ID,
					rootNoteId
				);

				// Track at-mention used
				trackBlockNoteAtMentionUsed( {
					postId: currentPostId,
					noteId: transformedNote.note_ID,
					parentNoteId: transformedNote.note_parent,
					sessionId: threadSessionId,
				} );

				// Mark as being processed in Redux store BEFORE AI call to prevent duplicates
				// This happens synchronously to prevent race conditions
				addInProcessBlockNote( transformedNote.note_ID, transformedNote.note_post_ID );

				// Process the note asynchronously
				processAiNote(
					transformedNote,
					agentSubmit,
					noteToBlockMap,
					processedNotesRef.current,
					editEntityRecord,
					saveEditedEntityRecord,
					currentPost,
					postType,
					threadSessionId
				)
					.then( () => {
						// Remove from Redux store now that it's persisted in database
						removeInProcessBlockNote( transformedNote.note_ID, transformedNote.note_post_ID );
					} )
					.catch( ( error ) => {
						// Clean up on error
						window.console?.error(
							`Block Notes: Error in async processing for note ID ${ transformedNote.note_ID }:`,
							error
						);
						removeInProcessBlockNote( transformedNote.note_ID, transformedNote.note_post_ID );
					} );
			} );
		}
	}, [
		currentPostId,
		currentUserId,
		blockNotes,
		blockNotesBeingProcessed,
		agentConfigState,
		agentSubmit,
		addInProcessBlockNote,
		removeInProcessBlockNote,
		registry,
		editEntityRecord,
		saveEditedEntityRecord,
		currentPost,
		postType,
	] );

	return (
		<>
			<BlockNoteMentionAutocomplete />
			<BlockNoteThinkingIndicator />
		</>
	);
}

function BlockNoteSubscriptions() {
	const agentConfigState = useAgentConfig( blockNotesAgentConfig );

	if ( ! agentConfigState ) {
		return null;
	}

	return <BlockNoteSubscriptionsChat agentConfigState={ agentConfigState } />;
}

export default BlockNoteSubscriptions;
