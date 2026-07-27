/**
 * Tests for BlockNoteMentionAutocomplete component
 *
 * This component handles DOM manipulation and CSS injection for block notes:
 * - Injects CSS styles for @ai mention pills
 * - Attaches placeholder text to note textareas
 * - Wraps @ai mentions with styled pill elements
 * - Uses MutationObserver to handle dynamic DOM changes
 */
import BlockNoteMentionAutocomplete, {
	MAX_RETRIES,
	PLACEHOLDER_TEXT,
	RETRY_DELAY_MS,
} from '@ai-block-notes/components/mention-autocomplete/index';
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

describe( 'BlockNoteMentionAutocomplete', () => {
	// Shared test constants
	const MENTION_TEXT = '@ai';
	const PILL_CLASS = 'bigsky-mention-pill';
	const NOTE_CLASS = 'editor-collab-sidebar-panel__user-comment';
	const NOTE_CONTENT_CLASS = 'editor-collab-sidebar-panel__note-content';
	const STYLE_ID = 'bigsky-mention-autocomplete-styles';

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

	describe( 'CSS Injection', () => {
		it( 'injects style element on mount when post ID exists', () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			// Check style element exists
			const styleElement = document.getElementById( STYLE_ID );
			expect( styleElement ).toBeInTheDocument();
			expect( styleElement!.tagName ).toBe( 'STYLE' );

			unmount();
		} );

		it( 'does not inject styles when no post ID', () => {
			mockGetCurrentPostId.mockReturnValue( null );

			render( <BlockNoteMentionAutocomplete /> );

			const styleElement = document.getElementById( STYLE_ID );
			expect( styleElement ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Placeholder Attachment', () => {
		describe( 'Textarea detection and attachment', () => {
			it( 'adds placeholder to textareas with comment-input- ID pattern', async () => {
				// Create textarea before rendering
				const textarea = document.createElement( 'textarea' );
				textarea.id = 'comment-input-1';
				document.body.appendChild( textarea );

				const { unmount } = render( <BlockNoteMentionAutocomplete /> );

				// Wait for placeholder to be attached
				await waitFor( () => {
					expect( textarea.placeholder ).toBe( PLACEHOLDER_TEXT );
				} );

				unmount();
			} );

			it( 'finds multiple textareas and attaches placeholders', async () => {
				// Create multiple textareas
				const textarea1 = document.createElement( 'textarea' );
				textarea1.id = 'comment-input-1';
				document.body.appendChild( textarea1 );

				const textarea2 = document.createElement( 'textarea' );
				textarea2.id = 'comment-input-2';
				document.body.appendChild( textarea2 );

				const { unmount } = render( <BlockNoteMentionAutocomplete /> );

				await waitFor( () => {
					expect( textarea1.placeholder ).toBe( PLACEHOLDER_TEXT );
					expect( textarea2.placeholder ).toBe( PLACEHOLDER_TEXT );
				} );

				unmount();
			} );

			it( 'does not override existing placeholder text', async () => {
				const textarea = document.createElement( 'textarea' );
				textarea.id = 'comment-input-1';
				textarea.placeholder = 'Existing placeholder';
				document.body.appendChild( textarea );

				render( <BlockNoteMentionAutocomplete /> );

				// Should keep existing placeholder
				await waitFor(
					() => {
						expect( textarea.placeholder ).toBe( 'Existing placeholder' );
					},
					{ timeout: 500 }
				);
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

			it( 'retries finding textareas if not found initially', async () => {
				const { unmount } = render( <BlockNoteMentionAutocomplete /> );

				// No textarea initially
				expect( document.querySelectorAll( 'textarea[id^="comment-input-"]' ).length ).toBe( 0 );

				// Add textarea after first attempt
				act( () => {
					jest.advanceTimersByTime( 100 ); // Partial delay
				} );

				const textarea = document.createElement( 'textarea' );
				textarea.id = 'comment-input-1';
				document.body.appendChild( textarea );

				// Advance past retry delay
				await act( async () => {
					jest.advanceTimersByTime( RETRY_DELAY_MS );
				} );

				// Should eventually attach
				await waitFor(
					() => {
						expect( textarea.placeholder ).toBe( PLACEHOLDER_TEXT );
					},
					{ timeout: 1000 }
				);

				unmount();
			} );

			it( 'stops retrying after MAX_RETRIES', () => {
				render( <BlockNoteMentionAutocomplete /> );

				// Advance through all retry attempts
				for ( let i = 0; i < MAX_RETRIES; i++ ) {
					act( () => {
						jest.advanceTimersByTime( RETRY_DELAY_MS );
					} );
				}

				// Add textarea after max retries
				const textarea = document.createElement( 'textarea' );
				textarea.id = 'comment-input-1';
				document.body.appendChild( textarea );

				// Advance time - should not retry anymore
				act( () => {
					jest.advanceTimersByTime( 1000 );
				} );

				// Placeholder should not be attached (retries exhausted)
				expect( textarea.placeholder ).toBe( '' );
			} );

			it( 'clears retry timeout on unmount', () => {
				const clearTimeoutSpy = jest.spyOn( globalThis, 'clearTimeout' );

				const { unmount } = render( <BlockNoteMentionAutocomplete /> );

				unmount();

				// Should have called clearTimeout at least once during cleanup
				expect( clearTimeoutSpy ).toHaveBeenCalled();

				clearTimeoutSpy.mockRestore();
			} );
		} );

		describe( 'Mention Styling', () => {
			const createNoteElement = ( text: string, className: string | null = null ) => {
				const div = document.createElement( 'div' );
				div.className = className || NOTE_CLASS;
				div.textContent = text;
				document.body.appendChild( div );
				return div;
			};

			it( 'wraps @ai mentions with pill class', async () => {
				const noteDiv = createNoteElement( `Hello ${ MENTION_TEXT } please help` );

				const { unmount } = render( <BlockNoteMentionAutocomplete /> );

				await waitFor( () => {
					const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
					expect( pill ).toBeInTheDocument();
					expect( pill!.textContent ).toBe( MENTION_TEXT );
				} );

				unmount();
			} );

			it( 'preserves surrounding text when wrapping mentions', async () => {
				const noteText = `Before ${ MENTION_TEXT } after`;
				const noteDiv = createNoteElement( noteText );

				render( <BlockNoteMentionAutocomplete /> );

				await waitFor( () => {
					const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
					expect( pill ).toBeInTheDocument();

					// Check full text is preserved
					expect( noteDiv.textContent ).toBe( noteText );
				} );
			} );

			it( 'wraps @ai mentions in newer note content elements', async () => {
				const noteDiv = createNoteElement( `Test ${ MENTION_TEXT } note`, NOTE_CONTENT_CLASS );

				render( <BlockNoteMentionAutocomplete /> );

				await waitFor( () => {
					const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
					expect( pill ).toBeInTheDocument();
					expect( pill!.textContent ).toBe( MENTION_TEXT );
				} );
			} );

			it( 'does not duplicate existing mention pills', async () => {
				const observerCallbacks: MutationCallback[] = [];
				const observeMock = jest.fn();
				const disconnectMock = jest.fn();
				window.MutationObserver = jest.fn( function (
					this: Pick< MutationObserver, 'observe' | 'disconnect' >,
					callback: MutationCallback
				) {
					observerCallbacks.push( callback );
					this.observe = observeMock;
					this.disconnect = disconnectMock;
				} ) as unknown as typeof MutationObserver;

				const noteText = `Test ${ MENTION_TEXT } note`;
				const noteDiv = createNoteElement( noteText );

				const { unmount } = render( <BlockNoteMentionAutocomplete /> );

				await waitFor( () => {
					expect( noteDiv.querySelectorAll( `.${ PILL_CLASS }` ) ).toHaveLength( 1 );
				} );

				const observerCallback = observerCallbacks[ 0 ];
				expect( observerCallback ).toBeInstanceOf( Function );

				act( () => {
					observerCallback?.( [], null as unknown as MutationObserver );
				} );

				await waitFor( () => {
					expect( noteDiv.querySelectorAll( `.${ PILL_CLASS }` ) ).toHaveLength( 1 );
				} );

				act( () => {
					noteDiv.textContent = noteText;
					observerCallback?.( [], null as unknown as MutationObserver );
				} );

				await waitFor( () => {
					expect( noteDiv.querySelectorAll( `.${ PILL_CLASS }` ) ).toHaveLength( 1 );
				} );

				unmount();
			} );

			it( 'skips elements without @ai mentions', async () => {
				const noteDiv = createNoteElement( 'Regular note without mention' );

				render( <BlockNoteMentionAutocomplete /> );

				await waitFor(
					() => {
						const pill = noteDiv.querySelector( '.bigsky-mention-pill' );
						expect( pill ).not.toBeInTheDocument();
					},
					{ timeout: 500 }
				);
			} );

			it( 'uses TreeWalker to handle nested text nodes', async () => {
				const noteDiv = document.createElement( 'div' );
				noteDiv.className = NOTE_CLASS;

				// Create nested structure
				const span = document.createElement( 'span' );
				span.textContent = `Nested ${ MENTION_TEXT } mention`;
				noteDiv.appendChild( span );
				document.body.appendChild( noteDiv );

				render( <BlockNoteMentionAutocomplete /> );

				await waitFor( () => {
					const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
					expect( pill ).toBeInTheDocument();
					expect( pill!.textContent ).toBe( MENTION_TEXT );
				} );
			} );
		} );
	} );

	describe( 'MutationObserver', () => {
		let observerCallbacks: MutationCallback[] = [];
		let observeMock: jest.Mock;
		let disconnectMock: jest.Mock;

		beforeEach( () => {
			observerCallbacks = [];
			observeMock = jest.fn();
			disconnectMock = jest.fn();

			// Mock MutationObserver
			window.MutationObserver = jest.fn( function ( this: any, callback: MutationCallback ) {
				observerCallbacks.push( callback );
				this.observe = observeMock;
				this.disconnect = disconnectMock;
			} ) as any;
		} );

		it( 'sets up MutationObserver on mount', () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			expect( window.MutationObserver ).toHaveBeenCalledWith( expect.any( Function ) );

			unmount();
		} );

		it( 'observes document.body with correct config', () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			expect( observeMock ).toHaveBeenCalledWith( document.body, {
				childList: true,
				subtree: true,
			} );

			unmount();
		} );

		it( 'disconnects observer on unmount', () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			unmount();

			expect( disconnectMock ).toHaveBeenCalled();
		} );

		it( 'processes new textareas added via DOM changes', async () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			// Simulate MutationObserver callback being triggered
			const callback = observerCallbacks[ 0 ];

			// Add new textarea
			const textarea = document.createElement( 'textarea' );
			textarea.id = 'comment-input-dynamic';
			document.body.appendChild( textarea );

			// Trigger observer callback
			act( () => {
				callback( [], null as unknown as MutationObserver );
			} );

			await waitFor( () => {
				expect( textarea.placeholder ).toBe( PLACEHOLDER_TEXT );
			} );

			unmount();
		} );

		it( 'processes new notes added via DOM changes', async () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			const callback = observerCallbacks[ 0 ];

			// Add new note element
			const noteDiv = document.createElement( 'div' );
			noteDiv.className = NOTE_CLASS;
			noteDiv.textContent = `Dynamic ${ MENTION_TEXT } note`;
			document.body.appendChild( noteDiv );

			// Trigger observer callback
			act( () => {
				callback( [], null as unknown as MutationObserver );
			} );

			await waitFor( () => {
				const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
				expect( pill ).toBeInTheDocument();
			} );

			unmount();
		} );
	} );

	describe( 'Cleanup', () => {
		it( 'handles unmount when no textareas were attached', () => {
			const { unmount } = render( <BlockNoteMentionAutocomplete /> );

			// Should not throw when unmounting with no textareas
			expect( () => unmount() ).not.toThrow();
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'handles empty note elements', async () => {
			const noteDiv = document.createElement( 'div' );
			noteDiv.className = NOTE_CLASS;
			noteDiv.textContent = '';
			document.body.appendChild( noteDiv );

			render( <BlockNoteMentionAutocomplete /> );

			await waitFor(
				() => {
					const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
					expect( pill ).not.toBeInTheDocument();
				},
				{ timeout: 500 }
			);
		} );

		it( 'handles special characters around @ai', async () => {
			const noteText = `Hey, ${ MENTION_TEXT }! Can you help?`;
			const noteDiv = document.createElement( 'div' );
			noteDiv.className = NOTE_CLASS;
			noteDiv.textContent = noteText;
			document.body.appendChild( noteDiv );

			render( <BlockNoteMentionAutocomplete /> );

			await waitFor( () => {
				const pill = noteDiv.querySelector( `.${ PILL_CLASS }` );
				expect( pill ).toBeInTheDocument();
				expect( noteDiv.textContent ).toBe( noteText );
			} );
		} );

		it( 'does not render any visible elements', () => {
			const { container } = render( <BlockNoteMentionAutocomplete /> );

			// Component should return null
			expect( container.firstChild ).toBeNull();
		} );
	} );
} );
