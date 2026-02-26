/**
 * Tests for BlockNoteThinkingIndicator component
 *
 * This component handles DOM manipulation and CSS injection for thinking indicators:
 * - Injects CSS styles for thinking indicator with shimmer animation
 * - Watches block note threads for @ai mentions in last note
 * - Applies/removes thinking indicator based on thread state
 * - Uses MutationObserver to handle dynamic DOM changes
 */
import BlockNoteThinkingIndicator, {
	MAX_RETRIES,
	RETRY_DELAY_MS,
} from '@block-notes/components/thinking-indicator/index';
import { act, render, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom';

// Mock WordPress dependencies
const mockGetCurrentPostId = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( callback: any ) => {
		const select = ( storeName: string ) => {
			if ( storeName === 'core/editor' ) {
				return {
					getCurrentPostId: mockGetCurrentPostId,
				};
			}
			return {};
		};
		return callback( select );
	} ),
} ) );

jest.mock( '@wordpress/editor', () => ( {
	store: 'core/editor',
} ) );

describe( 'BlockNoteThinkingIndicator', () => {
	// Shared test constants
	const INDICATOR_CLASS = 'bigsky-thinking-indicator';
	const INDICATOR_TEXT_CLASS = 'bigsky-thinking-text';
	const NOTE_CLASS = 'editor-collab-sidebar-panel__user-comment';
	const THREAD_ID_PREFIX = 'comment-thread-';
	const STYLE_ID = 'bigsky-thinking-indicator-styles';

	let originalMutationObserver: typeof MutationObserver;

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetCurrentPostId.mockReturnValue( 123 );

		// Clean up DOM
		document.body.innerHTML = '';
		document.head.innerHTML = '';

		// Store original MutationObserver
		originalMutationObserver = window.MutationObserver;
	} );

	afterEach( () => {
		// Restore original MutationObserver
		window.MutationObserver = originalMutationObserver;

		// Clean up DOM
		document.body.innerHTML = '';
		document.head.innerHTML = '';
	} );

	/**
	 * Helper function to create a thread with notes
	 * @param {number}   threadId  - The thread ID
	 * @param {string[]} noteTexts - Array of note text content
	 * @returns The thread container element
	 */
	const createThread = ( threadId: number, noteTexts: string[] ) => {
		const threadContainer = document.createElement( 'div' );
		threadContainer.id = `${ THREAD_ID_PREFIX }${ threadId }`;
		document.body.appendChild( threadContainer );

		noteTexts.forEach( ( text: string ) => {
			const noteDiv = document.createElement( 'div' );
			noteDiv.className = NOTE_CLASS;
			noteDiv.textContent = text;
			threadContainer.appendChild( noteDiv );
		} );

		return threadContainer;
	};

	describe( 'CSS Injection', () => {
		it( 'injects style element on mount when post ID exists', () => {
			const { unmount } = render( <BlockNoteThinkingIndicator /> );

			// Check style element exists
			const styleElement = document.getElementById( STYLE_ID );
			expect( styleElement ).toBeInTheDocument();
			expect( styleElement!.tagName ).toBe( 'STYLE' );

			// Check that styles include shimmer animation
			expect( styleElement!.textContent ).toContain( 'bigsky-thinking-shimmer' );
			expect( styleElement!.textContent ).toContain( 'bigsky-thinking-indicator' );
			expect( styleElement!.textContent ).toContain( 'bigsky-thinking-text' );

			unmount();
		} );

		it( 'does not inject styles when no post ID', () => {
			mockGetCurrentPostId.mockReturnValue( null );

			render( <BlockNoteThinkingIndicator /> );

			const styleElement = document.getElementById( STYLE_ID );
			expect( styleElement ).not.toBeInTheDocument();
		} );

		it( 'does not duplicate style element on multiple mounts', () => {
			const { unmount: unmount1 } = render( <BlockNoteThinkingIndicator /> );
			const { unmount: unmount2 } = render( <BlockNoteThinkingIndicator /> );

			const styleElements = document.querySelectorAll( `#${ STYLE_ID }` );
			expect( styleElements.length ).toBe( 1 );

			unmount1();
			unmount2();
		} );
	} );

	describe( 'Thinking Indicator Application', () => {
		describe( 'Basic indicator application', () => {
			it( 'applies thinking indicator to last note with @ai mention', async () => {
				const thread = createThread( 1, [ 'First note', 'Second note with @ai mention' ] );

				const { unmount } = render( <BlockNoteThinkingIndicator /> );

				await waitFor( () => {
					const indicator = thread.querySelector( `.${ INDICATOR_CLASS }` );
					expect( indicator ).toBeInTheDocument();
				} );

				unmount();
			} );

			it( 'does not apply indicator when last note has no @ai mention', async () => {
				const thread = createThread( 1, [
					'First note with @ai mention',
					'Second note without mention',
				] );

				render( <BlockNoteThinkingIndicator /> );

				// Wait and verify no indicator
				await waitFor(
					() => {
						const indicator = thread.querySelector( `.${ INDICATOR_CLASS }` );
						expect( indicator ).not.toBeInTheDocument();
					},
					{ timeout: 500 }
				);
			} );

			it( 'includes SVG icon and text in indicator', async () => {
				const thread = createThread( 1, [ 'Note with @ai' ] );

				render( <BlockNoteThinkingIndicator /> );

				await waitFor( () => {
					const indicator = thread.querySelector( `.${ INDICATOR_CLASS }` );
					expect( indicator ).toBeInTheDocument();

					// Check for image
					const img = indicator.querySelector( 'img' );
					expect( img ).toBeInTheDocument();
					expect( img!.src ).toContain( 'big-sky.svg' );
					expect( img!.width ).toBe( 14 );
					expect( img!.height ).toBe( 14 );

					// Check for text
					const textSpan = indicator.querySelector( `.${ INDICATOR_TEXT_CLASS }` );
					expect( textSpan ).toBeInTheDocument();
					expect( textSpan!.textContent ).toBe( 'Thinking…' );
				} );
			} );
		} );

		describe( 'Multiple threads', () => {
			it( 'handles multiple threads independently', async () => {
				const thread1 = createThread( 1, [ 'Thread 1 with @ai' ] );
				const thread2 = createThread( 2, [ 'Thread 2 no mention' ] );
				const thread3 = createThread( 3, [ 'Thread 3 with @ai' ] );

				render( <BlockNoteThinkingIndicator /> );

				await waitFor( () => {
					// Thread 1 and 3 should have indicators
					expect( thread1.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
					expect( thread3.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();

					// Thread 2 should not have indicator
					expect( thread2.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
				} );
			} );

			it( 'applies indicators to all qualifying threads', async () => {
				const thread1 = createThread( 1, [ '@ai help me' ] );
				const thread2 = createThread( 2, [ 'Can you @ai assist' ] );
				const thread3 = createThread( 3, [ 'Please @ai review' ] );

				render( <BlockNoteThinkingIndicator /> );

				await waitFor( () => {
					expect( thread1.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
					expect( thread2.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
					expect( thread3.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
				} );
			} );
		} );

		describe( 'Indicator removal', () => {
			it( 'removes indicator when last note no longer has @ai', async () => {
				const thread = createThread( 1, [ 'Note with @ai' ] );

				const { unmount } = render( <BlockNoteThinkingIndicator /> );

				// Wait for indicator to be applied
				await waitFor( () => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
				} );

				// Update last note to remove @ai mention
				const lastNote = thread.querySelector( `.${ NOTE_CLASS }` );
				lastNote!.textContent = 'Updated note without mention';

				// Trigger MutationObserver by adding a class
				await act( async () => {
					thread.classList.add( 'updated' );
				} );

				// Wait for indicator to be removed
				await waitFor( () => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
				} );

				unmount();
			} );

			it( 'removes indicator when new note is added without @ai', async () => {
				const thread = createThread( 1, [ 'First note with @ai' ] );

				render( <BlockNoteThinkingIndicator /> );

				// Wait for indicator
				await waitFor( () => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
				} );

				// Add new note without @ai (simulating AI response)
				await act( async () => {
					const newNote = document.createElement( 'div' );
					newNote.className = NOTE_CLASS;
					newNote.textContent = 'AI response here';
					thread.appendChild( newNote );
				} );

				// Indicator should be removed
				await waitFor( () => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
				} );
			} );
		} );

		describe( 'Edge cases', () => {
			it( 'does not apply indicator to empty thread', async () => {
				const thread = document.createElement( 'div' );
				thread.id = `${ THREAD_ID_PREFIX }1`;
				document.body.appendChild( thread );

				render( <BlockNoteThinkingIndicator /> );

				await waitFor(
					() => {
						expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
					},
					{ timeout: 500 }
				);
			} );

			it( 'does not duplicate indicator if already present', async () => {
				const thread = createThread( 1, [ 'Note with @ai' ] );

				render( <BlockNoteThinkingIndicator /> );

				// Wait for first indicator
				await waitFor( () => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
				} );

				// Trigger observer again
				await act( async () => {
					thread.classList.add( 'trigger-observer' );
				} );

				// Should still only have one indicator
				const indicators = thread.querySelectorAll( `.${ INDICATOR_CLASS }` );
				expect( indicators.length ).toBe( 1 );
			} );
		} );
	} );

	describe( 'MutationObserver Integration', () => {
		it( 'observes DOM changes and processes new threads', async () => {
			render( <BlockNoteThinkingIndicator /> );

			// Add thread after component mount
			await act( async () => {
				createThread( 1, [ 'New thread with @ai' ] );
			} );

			// Should detect and process new thread
			await waitFor( () => {
				const thread = document.getElementById( `${ THREAD_ID_PREFIX }1` );
				expect( thread!.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
			} );
		} );

		it( 'reprocesses threads when notes are added', async () => {
			const thread = createThread( 1, [ 'First note' ] );

			render( <BlockNoteThinkingIndicator /> );

			// Initially no indicator (no @ai)
			await waitFor(
				() => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
				},
				{ timeout: 500 }
			);

			// Add note with @ai
			await act( async () => {
				const newNote = document.createElement( 'div' );
				newNote.className = NOTE_CLASS;
				newNote.textContent = 'New note with @ai';
				thread.appendChild( newNote );
			} );

			// Should now have indicator
			await waitFor( () => {
				expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
			} );
		} );

		it( 'disconnects observer on unmount', () => {
			const disconnectSpy = jest.fn();
			const mockObserver = {
				observe: jest.fn(),
				disconnect: disconnectSpy,
			};

			window.MutationObserver = jest.fn( () => mockObserver ) as any;

			const { unmount } = render( <BlockNoteThinkingIndicator /> );

			unmount();

			expect( disconnectSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'Retry Mechanism', () => {
		beforeEach( () => {
			jest.useFakeTimers();
		} );

		afterEach( () => {
			jest.runOnlyPendingTimers();
			jest.useRealTimers();
		} );

		it( 'retries finding threads if not found initially', async () => {
			const { unmount } = render( <BlockNoteThinkingIndicator /> );

			// No threads initially
			expect( document.querySelectorAll( `[id^="${ THREAD_ID_PREFIX }"]` ).length ).toBe( 0 );

			// Add thread after first attempt
			act( () => {
				jest.advanceTimersByTime( 100 );
			} );

			const thread = createThread( 1, [ 'Note with @ai' ] );

			// Advance past retry delay
			await act( async () => {
				jest.advanceTimersByTime( RETRY_DELAY_MS );
			} );

			// Should eventually process thread
			await waitFor(
				() => {
					expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
				},
				{ timeout: 1000 }
			);

			unmount();
		} );

		it( 'stops retrying after MAX_RETRIES', () => {
			render( <BlockNoteThinkingIndicator /> );

			// Advance through all retry attempts
			for ( let i = 0; i < MAX_RETRIES; i++ ) {
				act( () => {
					jest.advanceTimersByTime( RETRY_DELAY_MS );
				} );
			}

			// Add thread after max retries
			const thread = createThread( 1, [ 'Note with @ai' ] );

			// Advance time - should not retry anymore
			act( () => {
				jest.advanceTimersByTime( 1000 );
			} );

			// Indicator should not be applied (retries exhausted)
			expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
		} );

		it( 'clears retry timeout on unmount', () => {
			const clearTimeoutSpy = jest.spyOn( globalThis, 'clearTimeout' );

			const { unmount } = render( <BlockNoteThinkingIndicator /> );

			unmount();

			expect( clearTimeoutSpy ).toHaveBeenCalled();

			clearTimeoutSpy.mockRestore();
		} );
	} );

	describe( 'Cleanup', () => {
		it( 'does not process new threads after unmount', async () => {
			const { unmount } = render( <BlockNoteThinkingIndicator /> );
			unmount();

			// Add a thread with @ai mention after unmount
			const thread = createThread( 1, [ 'Note with @ai' ] );

			// Allow any async work to settle
			await act( async () => {} );

			// Observer is disconnected — no indicator should be applied
			expect( thread.querySelector( `.${ INDICATOR_CLASS }` ) ).not.toBeInTheDocument();
		} );

		it( 'does not remove indicators from DOM on unmount', async () => {
			const thread1 = createThread( 1, [ 'Thread 1 with @ai' ] );
			const thread2 = createThread( 2, [ 'Thread 2 with @ai' ] );

			const { unmount } = render( <BlockNoteThinkingIndicator /> );

			// Wait for indicators
			await waitFor( () => {
				expect( thread1.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
				expect( thread2.querySelector( `.${ INDICATOR_CLASS }` ) ).toBeInTheDocument();
			} );

			unmount();

			// Indicators remain in DOM after unmount — component only manages application, not removal
			const allIndicators = document.querySelectorAll( `.${ INDICATOR_CLASS }` );
			expect( allIndicators.length ).toBe( 2 );
		} );
	} );
} );
