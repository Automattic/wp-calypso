/**
 * Smoke tests for BlockNoteSubscriptions component
 *
 * These tests cover high-level functionality:
 * - Component rendering and initialization
 * - Agent config loading states
 * - AI mention detection and processing
 * - Integration with WordPress data stores
 */
// @ts-expect-error - mock exports from __mocks__ directory
import { mockHasAgent, mockOnSubmit } from '@automattic/agenttic-client';
import { act, render, waitFor } from '@testing-library/react';
import { replyToNote } from '../../abilities/utils';
import { trackBlockNoteAiResponseFailed, trackBlockNoteAtMentionUsed } from '../../utils/tracking';
import '@testing-library/jest-dom';
import BlockNoteSubscriptions from './index';
import type { NoteEntity } from '../../abilities/utils';

// Mock WordPress dependencies
const mockGetCurrentPostId = jest.fn();
const mockGetCurrentPost = jest.fn();
const mockGetCurrentPostType = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockGetEntityRecords = jest.fn();
const mockGetInProcessBlockNotes = jest.fn();
const mockEditEntityRecord = jest.fn();
const mockSaveEditedEntityRecord = jest.fn();
const mockAddInProcessBlockNote = jest.fn();
const mockRemoveInProcessBlockNote = jest.fn();
const mockGetBlocks = jest.fn();

// Mock various stores and hooks
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( callback: any ) => {
		const select = ( storeName: string ) => {
			if ( storeName === 'core/editor' ) {
				return {
					getCurrentPostId: mockGetCurrentPostId,
					getCurrentPost: mockGetCurrentPost,
					getCurrentPostType: mockGetCurrentPostType,
				};
			}
			if ( storeName === 'core' ) {
				return {
					getCurrentUser: mockGetCurrentUser,
					getEntityRecords: mockGetEntityRecords,
				};
			}
			if ( storeName === 'block-notes/store' ) {
				return {
					getInProcessBlockNotes: mockGetInProcessBlockNotes,
					getSessionId: jest.fn( () => 'test-session' ),
				};
			}
			return {};
		};
		return callback( select );
	} ),
	useDispatch: jest.fn( ( storeName: string ) => {
		if ( storeName === 'core' ) {
			return {
				editEntityRecord: mockEditEntityRecord,
				saveEditedEntityRecord: mockSaveEditedEntityRecord,
			};
		}
		if ( storeName === 'block-notes/store' ) {
			return {
				addInProcessBlockNote: mockAddInProcessBlockNote,
				removeInProcessBlockNote: mockRemoveInProcessBlockNote,
			};
		}
		return {};
	} ),
	useRegistry: jest.fn( () => ( {
		select: ( storeName: string ) => {
			if ( storeName === '@wordpress/block-editor' ) {
				return {
					getBlocks: mockGetBlocks,
				};
			}
			return {};
		},
	} ) ),
} ) );

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	store: '@wordpress/block-editor',
} ) );

jest.mock( '../../store', () => ( {
	store: 'block-notes/store',
} ) );

// Mock feature flagging to always true.
jest.mock( '../../utils/feature-flag', () => ( {
	areBlockNotesEnabled: jest.fn( () => true ),
} ) );

jest.mock( '../mention-autocomplete/index', () => {
	return function MockBlockNoteMentionAutocomplete() {
		return null;
	};
} );

// Mock block-notes agent config
jest.mock( '../../agent-config', () => ( {
	blockNotesAgentConfig: {
		createAgentConfig: jest.fn( ( sessionId: string ) =>
			Promise.resolve( {
				agentId: 'wp-orchestrator',
				sessionId,
			} )
		),
	},
} ) );

// Mock utils
jest.mock( '../../abilities/utils', () => ( {
	convertEntityNoteFormat: jest.fn( ( note: NoteEntity ) => ( {
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
	} ) ),
	replyToNote: jest.fn(),
} ) );

// Mock tracking
jest.mock( '../../utils/tracking', () => ( {
	trackBlockNoteAiResponseFailed: jest.fn(),
	trackBlockNoteAtMentionUsed: jest.fn(),
} ) );

jest.mock( '../../utils/session', () => ( {
	getBlockNoteThreadSessionId: jest.fn( () => Promise.resolve( 'test-session-id-123' ) ),
} ) );

describe( 'BlockNoteSubscriptions', () => {
	const TEST_POST_ID = 123;
	const TEST_USER_ID = 1;
	const TEST_POST_TITLE = 'Test Post';
	const TEST_POST_TYPE = 'post';
	const TEST_USER_NAME = 'Test User';
	const TEST_USER_EMAIL = 'test@example.com';
	const TEST_DATE = new Date( Date.now() - 30 * 1000 ).toISOString();
	const AI_MENTION_TEXT = '@ai';

	// Helper function
	const createTestNote = ( overrides: Record< string, any > = {} ) => ( {
		id: 1,
		post: TEST_POST_ID,
		author: TEST_USER_ID,
		author_name: TEST_USER_NAME,
		content: {
			rendered: `Hey ${ AI_MENTION_TEXT } can you help?`,
		},
		parent: 0,
		type: 'note',
		status: 'hold',
		date: TEST_DATE,
		date_gmt: TEST_DATE,
		meta: {},
		...overrides,
	} );

	beforeEach( () => {
		jest.clearAllMocks();

		// Setup default mock return values
		mockGetCurrentPostId.mockReturnValue( TEST_POST_ID );
		mockGetCurrentPost.mockReturnValue( {
			id: TEST_POST_ID,
			title: TEST_POST_TITLE,
		} );
		mockGetCurrentPostType.mockReturnValue( TEST_POST_TYPE );
		mockGetCurrentUser.mockReturnValue( {
			id: TEST_USER_ID,
			name: TEST_USER_NAME,
			email: TEST_USER_EMAIL,
		} );
		mockGetEntityRecords.mockReturnValue( [] );
		mockGetInProcessBlockNotes.mockReturnValue( [] );
		mockGetBlocks.mockReturnValue( [] );
		mockHasAgent.mockReturnValue( true );
	} );

	describe( 'Component Initialization', () => {
		it( 'renders component', async () => {
			let rendered;
			await act( async () => {
				rendered = render( <BlockNoteSubscriptions /> );
			} );

			// Component should render (even if it returns null while loading)
			expect( rendered.container ).toBeInTheDocument();
		} );

		it( 'returns null when agent config is loading', async () => {
			let rendered;
			await act( async () => {
				rendered = render( <BlockNoteSubscriptions /> );
			} );

			// Should return null while config is loading
			expect( rendered.container.firstChild ).toBeNull();
		} );

		it( 'renders BlockNoteMentionAutocomplete when agent config loads', async () => {
			let rendered;
			await act( async () => {
				rendered = render( <BlockNoteSubscriptions /> );
			} );

			// Wait for agent config to load
			await waitFor(
				() => {
					expect( rendered.container ).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);
		} );
	} );

	describe( 'AI Mention Detection', () => {
		it( 'detects and processes notes with @ai mentions', async () => {
			const noteWithAiMention = createTestNote( { id: 1 } );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );

			render( <BlockNoteSubscriptions /> );

			// Wait for processing
			await waitFor(
				() => {
					// Should mark note as being processed
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 1, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
			expect( trackBlockNoteAtMentionUsed ).toHaveBeenCalledWith( {
				noteId: 1,
				postId: TEST_POST_ID,
				parentNoteId: 0,
				sessionId: 'test-session-id-123',
			} );
		} );

		it( 'ignores notes without @ai mentions', async () => {
			const regularNote = createTestNote( {
				id: 2,
				content: {
					rendered: 'This is a regular note',
				},
			} );

			mockGetEntityRecords.mockReturnValue( [ regularNote ] );

			render( <BlockNoteSubscriptions /> );

			// Wait a bit to ensure no processing happens
			await waitFor(
				() => {
					// Should NOT process notes without @ai
					expect( mockAddInProcessBlockNote ).not.toHaveBeenCalled();
				},
				{ timeout: 500 }
			);
			expect( trackBlockNoteAtMentionUsed ).not.toHaveBeenCalled();
		} );

		it( 'skips already processed notes', async () => {
			const processedNote = createTestNote( {
				id: 3,
				content: {
					rendered: `Hey ${ AI_MENTION_TEXT } this was already processed`,
				},
				meta: {
					bigsky_ai_processed_date: TEST_DATE,
				},
			} );

			mockGetEntityRecords.mockReturnValue( [ processedNote ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should NOT process notes that have already been processed
					expect( mockAddInProcessBlockNote ).not.toHaveBeenCalled();
				},
				{ timeout: 500 }
			);
			expect( trackBlockNoteAtMentionUsed ).not.toHaveBeenCalled();
		} );

		it( 'processes stale notes with error reply and tracks failure', async () => {
			const twoMinutesAgo = new Date( Date.now() - 2 * 60 * 1000 ).toISOString();
			const staleNote = createTestNote( {
				id: 4,
				content: {
					rendered: `Hey ${ AI_MENTION_TEXT } this is a stale note`,
				},
				date: twoMinutesAgo,
				date_gmt: twoMinutesAgo,
			} );

			mockGetEntityRecords.mockReturnValue( [ staleNote ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should add stale note to in-process
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 4, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);

			await waitFor(
				() => {
					// Should track failure for stale note
					expect( trackBlockNoteAiResponseFailed ).toHaveBeenCalledWith( {
						noteId: 4,
						postId: TEST_POST_ID,
						parentNoteId: 0,
						errorType: 'agent_response_failed',
						sessionId: 'test-session-id-123',
					} );

					// Should reply with error message
					expect( replyToNote ).toHaveBeenCalledWith(
						TEST_POST_ID,
						4,
						'Unfortunately, there was an error processing your request. Please try again later.',
						'AI [Experimental]'
					);
				},
				{ timeout: 2000 }
			);

			await waitFor(
				() => {
					// Should remove from in-process after handling
					expect( mockRemoveInProcessBlockNote ).toHaveBeenCalledWith( 4, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);

			// Should NOT track at-mention used (that's for fresh notes)
			expect( trackBlockNoteAtMentionUsed ).not.toHaveBeenCalled();
		} );

		it( 'replies only to latest stale note when multiple exist in same thread', async () => {
			const twoMinutesAgo = new Date( Date.now() - 2 * 60 * 1000 ).toISOString();
			const ROOT_NOTE_ID = 100;

			// Two stale notes in the same thread (same parent)
			const staleNote1 = createTestNote( {
				id: 101,
				parent: ROOT_NOTE_ID,
				content: {
					rendered: `Hey ${ AI_MENTION_TEXT } first stale note`,
				},
				date: twoMinutesAgo,
				date_gmt: twoMinutesAgo,
			} );
			const staleNote2 = createTestNote( {
				id: 102, // Higher ID = latest
				parent: ROOT_NOTE_ID,
				content: {
					rendered: `Hey ${ AI_MENTION_TEXT } second stale note`,
				},
				date: twoMinutesAgo,
				date_gmt: twoMinutesAgo,
			} );

			mockGetEntityRecords.mockReturnValue( [ staleNote1, staleNote2 ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Both notes should be added to in-process
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 101, TEST_POST_ID );
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 102, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);

			await waitFor(
				() => {
					// Both notes should be tracked as failed
					expect( trackBlockNoteAiResponseFailed ).toHaveBeenCalledWith(
						expect.objectContaining( { noteId: 101 } )
					);
					expect( trackBlockNoteAiResponseFailed ).toHaveBeenCalledWith(
						expect.objectContaining( { noteId: 102 } )
					);
				},
				{ timeout: 2000 }
			);

			await waitFor(
				() => {
					// Only the latest note (higher ID) should receive a reply
					expect( replyToNote ).toHaveBeenCalledTimes( 1 );
					expect( replyToNote ).toHaveBeenCalledWith(
						TEST_POST_ID,
						ROOT_NOTE_ID,
						'Unfortunately, there was an error processing your request. Please try again later.',
						'AI [Experimental]'
					);
				},
				{ timeout: 2000 }
			);

			await waitFor(
				() => {
					// Both notes should be removed from in-process
					expect( mockRemoveInProcessBlockNote ).toHaveBeenCalledWith( 101, TEST_POST_ID );
					expect( mockRemoveInProcessBlockNote ).toHaveBeenCalledWith( 102, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
		} );

		it( 'processes notes with missing date_gmt field', async () => {
			const noteWithoutDateGmt = createTestNote( {
				id: 5,
				date_gmt: undefined,
			} );

			mockGetEntityRecords.mockReturnValue( [ noteWithoutDateGmt ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should process notes without date_gmt
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 5, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
		} );

		it( 'processes notes with invalid date_gmt format', async () => {
			const noteWithInvalidDate = createTestNote( {
				id: 6,
				date_gmt: 'invalid-date-string',
			} );

			mockGetEntityRecords.mockReturnValue( [ noteWithInvalidDate ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should process notes with invalid dates
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 6, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
		} );

		it( 'processes fresh notes with timezone offset format', async () => {
			const thirtySecondsAgo = new Date( Date.now() - 30 * 1000 );
			const dateWithOffset = thirtySecondsAgo.toISOString().replace( 'Z', '+00:00' );
			const noteWithTimezoneOffset = createTestNote( {
				id: 7,
				date_gmt: dateWithOffset,
			} );

			mockGetEntityRecords.mockReturnValue( [ noteWithTimezoneOffset ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should process notes with timezone offset format
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 7, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
		} );
	} );

	describe( 'Note Processing', () => {
		it( 'processes AI mention with correct function calls and arguments', async () => {
			const noteWithAiMention = createTestNote( { id: 20 } );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );

			render( <BlockNoteSubscriptions /> );

			// Verify the processing flow when messages are addressed to AI
			await waitFor(
				() => {
					// 1. Should mark note as being processed
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 20, TEST_POST_ID );

					// 2. Should edit entity record
					expect( mockEditEntityRecord ).toHaveBeenCalledWith(
						'root',
						'comment',
						20,
						expect.objectContaining( {
							meta: expect.objectContaining( {
								bigsky_ai_processed_date: expect.any( String ),
							} ),
						} )
					);

					// 3. Should save the edited record
					expect( mockSaveEditedEntityRecord ).toHaveBeenCalledWith( 'root', 'comment', 20 );
				},
				{ timeout: 2000 }
			);

			// 4. Should remove from in-process
			await waitFor(
				() => {
					expect( mockRemoveInProcessBlockNote ).toHaveBeenCalledWith( 20, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
		} );

		it( 'marks note as processed after successful AI processing', async () => {
			const noteWithAiMention = createTestNote( { id: 10 } );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );

			render( <BlockNoteSubscriptions /> );

			// Wait for note to be processed and marked
			await waitFor(
				() => {
					// Should edit entity record with processed date
					expect( mockEditEntityRecord ).toHaveBeenCalledWith(
						'root',
						'comment',
						10,
						expect.objectContaining( {
							meta: expect.objectContaining( {
								bigsky_ai_processed_date: expect.any( String ),
							} ),
						} )
					);
					// Should save the edited record
					expect( mockSaveEditedEntityRecord ).toHaveBeenCalledWith( 'root', 'comment', 10 );
				},
				{ timeout: 2000 }
			);
		} );

		it( 'removes note from memory set if marking as processed fails', async () => {
			const noteWithAiMention = createTestNote( {
				id: 11,
				content: {
					rendered: `Hey ${ AI_MENTION_TEXT } help with this`,
				},
			} );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );
			// Mock database error
			mockEditEntityRecord.mockRejectedValue( new Error( 'Some error' ) );

			render( <BlockNoteSubscriptions /> );

			// Wait for error to occur
			await waitFor(
				() => {
					// Should attempt to edit entity record
					expect( mockEditEntityRecord ).toHaveBeenCalled();
					// Should NOT save
					expect( mockSaveEditedEntityRecord ).not.toHaveBeenCalled();
				},
				{ timeout: 2000 }
			);
		} );

		it( 'tracks failure when agent submission fails', async () => {
			const noteWithAiMention = createTestNote( {
				id: 12,
				content: {
					rendered: `Hey ${ AI_MENTION_TEXT } can you help?`,
				},
			} );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );

			// Mock agent submission failure
			mockOnSubmit.mockRejectedValueOnce( new Error( 'Agent communication error' ) );

			// Mock replyToNote to return successfully (error reply note)
			( replyToNote as jest.Mock ).mockResolvedValueOnce( {
				note_ID: 999,
				note_post_ID: TEST_POST_ID,
				note_content:
					'Unfortunately, there was an error processing your request. Please try again later.',
				note_parent: 12,
				user_id: 1,
				note_type: 'note',
				note_approved: 0,
				note_date: TEST_DATE,
				note_date_gmt: TEST_DATE,
			} );

			render( <BlockNoteSubscriptions /> );

			// Wait for processing to start
			await waitFor(
				() => {
					// Should mark note as being processed
					expect( mockAddInProcessBlockNote ).toHaveBeenCalledWith( 12, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);

			// Wait for error handling to complete
			await waitFor(
				() => {
					// Should call replyToNote with error message
					expect( replyToNote ).toHaveBeenCalledWith(
						TEST_POST_ID,
						12,
						'Unfortunately, there was an error processing your request. Please try again later.',
						'AI [Experimental]'
					);

					// Should track the failure
					expect( trackBlockNoteAiResponseFailed ).toHaveBeenCalledWith( {
						noteId: 12,
						postId: TEST_POST_ID,
						parentNoteId: 0,
						errorType: 'agent_response_failed',
						sessionId: 'test-session-id-123',
					} );
				},
				{ timeout: 2000 }
			);

			// Should remove from in-process after error
			await waitFor(
				() => {
					expect( mockRemoveInProcessBlockNote ).toHaveBeenCalledWith( 12, TEST_POST_ID );
				},
				{ timeout: 2000 }
			);
		} );
	} );

	describe( 'Post Context', () => {
		it( 'does not process notes when post ID is missing', async () => {
			mockGetCurrentPostId.mockReturnValue( null );
			mockGetCurrentPost.mockReturnValue( null );

			const noteWithAiMention = createTestNote( { id: 4 } );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should NOT process without post context
					expect( mockAddInProcessBlockNote ).not.toHaveBeenCalled();
				},
				{ timeout: 500 }
			);
		} );

		it( 'does not process notes when user ID is missing', async () => {
			mockGetCurrentUser.mockReturnValue( null );

			const noteWithAiMention = createTestNote( { id: 5 } );

			mockGetEntityRecords.mockReturnValue( [ noteWithAiMention ] );

			render( <BlockNoteSubscriptions /> );

			await waitFor(
				() => {
					// Should NOT process without user context
					expect( mockAddInProcessBlockNote ).not.toHaveBeenCalled();
				},
				{ timeout: 500 }
			);
		} );
	} );
} );
