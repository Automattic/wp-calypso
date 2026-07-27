import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import bigSkySvg from '../../assets/big-sky.svg';
import { hasAiMention } from '../../utils/content';
import { BLOCK_NOTE_CONTENT_SELECTOR, BLOCK_NOTE_THREAD_SELECTOR } from '../../utils/selectors';

export const MAX_RETRIES = 5;
export const RETRY_DELAY_MS = 200;

type NoteEntity = {
	id: number;
	parent?: number;
	content?: string | { raw?: string; rendered?: string };
	meta?: {
		bigsky_ai_processed_date?: string;
	};
};

function getNoteContent( note: NoteEntity ): string {
	if ( typeof note.content === 'string' ) {
		return note.content;
	}

	return note.content?.raw || note.content?.rendered || '';
}

function getThreadRootNoteId( threadContainer: Element ): number | null {
	const match = threadContainer.id.match( /^(?:note|comment)-thread-(\d+)(?:\D.*)?$/ );
	if ( ! match ) {
		return null;
	}

	return Number( match[ 1 ] );
}

function getPendingAiThreadIds( notes: NoteEntity[] | null ): number[] | null {
	if ( ! notes ) {
		return null;
	}

	const latestNoteByThread = notes.reduce( ( acc, note ) => {
		const rootNoteId = note.parent || note.id;
		const latestNote = acc.get( rootNoteId );

		if ( ! latestNote || note.id > latestNote.id ) {
			acc.set( rootNoteId, note );
		}

		return acc;
	}, new Map< number, NoteEntity >() );

	return Array.from( latestNoteByThread.entries() )
		.filter( ( [ , note ] ) => {
			const isProcessed = !! note.meta?.bigsky_ai_processed_date;
			return hasAiMention( getNoteContent( note ) ) && ! isProcessed;
		} )
		.map( ( [ rootNoteId ] ) => rootNoteId );
}

/**
 * BlockNoteThinkingIndicator Component
 *
 * Watches block note threads and displays a "Thinking..." indicator
 * when the last note in a thread has an @ai mention and no AI response yet.
 */
function BlockNoteThinkingIndicator() {
	const attachedThreadsRef = useRef( new Set< string >() );
	const retryTimeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	const { currentPostId } = useSelect( ( select ) => {
		const postId = select( editorStore ).getCurrentPostId();
		return {
			currentPostId: postId,
		};
	}, [] );

	const pendingAiThreadIds = useSelect(
		( select ) => {
			if ( ! currentPostId ) {
				return null;
			}

			const notes = select( coreStore ).getEntityRecords< NoteEntity >( 'root', 'comment', {
				post: currentPostId,
				type: 'note',
				status: 'any',
				per_page: 100,
				context: 'edit',
				_locale: 'user',
				_fields: 'id,content,meta,parent',
			} );

			return getPendingAiThreadIds( notes );
		},
		[ currentPostId ]
	);

	/**
	 * Apply thinking indicator to a last note of thread if @ai mention is present
	 * Remove if not.
	 * @param threadContainer - The thread container element
	 */
	const applyThinkingIndicatorToThread = useCallback(
		( threadContainer: Element ) => {
			const threadId = threadContainer.id;

			// Find all notes in this thread
			const noteComments = threadContainer.querySelectorAll( BLOCK_NOTE_CONTENT_SELECTOR );

			if ( noteComments.length === 0 ) {
				return;
			}

			const lastNote = noteComments[ noteComments.length - 1 ];
			const textContent = lastNote.textContent || '';
			const rootNoteId = getThreadRootNoteId( threadContainer );
			const isPendingAiThread =
				pendingAiThreadIds === null
					? hasAiMention( textContent )
					: rootNoteId !== null && pendingAiThreadIds.includes( rootNoteId );

			if ( ! isPendingAiThread ) {
				const existingIndicator = threadContainer.querySelector( '.bigsky-thinking-indicator' );
				if ( existingIndicator ) {
					existingIndicator.remove();
				}
				attachedThreadsRef.current.delete( threadId );
				return;
			}

			// If thread already has thinking indicator, skip
			if ( lastNote.querySelector( '.bigsky-thinking-indicator' ) ) {
				attachedThreadsRef.current.add( threadId );
				return;
			}

			// Create thinking indicator element
			const indicator = document.createElement( 'div' );
			indicator.className = 'bigsky-thinking-indicator';
			indicator.innerHTML = `
				<img src="${ bigSkySvg }" width="14" height="14" alt="" />
				<span class="bigsky-thinking-text">${ __( 'Thinking…', __i18n_text_domain__ ) }</span>
			`;

			lastNote.appendChild( indicator );
			attachedThreadsRef.current.add( threadId );
		},
		[ pendingAiThreadIds ]
	);

	/**
	 * Find and process all block note threads
	 */
	const processAllThreads = useCallback(
		( attempt = 1 ) => {
			// Clear any existing timeout before proceeding
			if ( retryTimeoutRef.current ) {
				clearTimeout( retryTimeoutRef.current );
				retryTimeoutRef.current = null;
			}

			// Find all thread containers
			const threadContainers = document.querySelectorAll( BLOCK_NOTE_THREAD_SELECTOR );

			if ( threadContainers.length === 0 && attempt < MAX_RETRIES ) {
				// Store timeout ID for cleanup
				retryTimeoutRef.current = setTimeout( () => {
					processAllThreads( attempt + 1 );
				}, RETRY_DELAY_MS );
				return;
			}

			threadContainers.forEach( ( threadContainer ) => {
				applyThinkingIndicatorToThread( threadContainer );
			} );
		},
		[ applyThinkingIndicatorToThread ]
	);

	// Setup effect
	useEffect( () => {
		if ( ! currentPostId ) {
			return;
		}

		// Inject thinking indicator styles
		const styleId = 'bigsky-thinking-indicator-styles';
		const existingStyle = document.getElementById( styleId );

		if ( ! existingStyle ) {
			const styleElement = document.createElement( 'style' );
			styleElement.id = styleId;
			styleElement.textContent = `
				@keyframes bigsky-thinking-shimmer {
					0% { background-position: 200% 0; }
					100% { background-position: -200% 0; }
				}

				.bigsky-thinking-indicator {
					display: flex;
					align-items: center;
					gap: 6px;
					margin-top: 8px;
				}

				.bigsky-thinking-indicator img {
					flex-shrink: 0;
				}

				.bigsky-thinking-text {
					font-size: 14px;
					line-height: 160%;
					letter-spacing: -0.15px;
					color: #6b7280;
					background: linear-gradient(90deg, color-mix(in srgb, currentColor 30%, transparent), currentColor, color-mix(in srgb, currentColor 30%, transparent));
					background-size: 200% 100%;
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					animation: bigsky-thinking-shimmer 2000ms infinite linear;
				}

				@media (prefers-reduced-motion: reduce) {
					.bigsky-thinking-text {
						animation: none;
						-webkit-text-fill-color: #6b7280;
					}
				}
			`;
			document.head.appendChild( styleElement );
		}

		// Initial processing
		processAllThreads();

		// Use MutationObserver to detect changes to threads
		const observer = new window.MutationObserver( () => {
			processAllThreads();
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );

		// Store current ref value for cleanup
		const currentAttachedThreads = attachedThreadsRef.current;

		// Cleanup
		return () => {
			observer.disconnect();

			// Clear any pending retry timeout
			if ( retryTimeoutRef.current ) {
				clearTimeout( retryTimeoutRef.current );
			}

			currentAttachedThreads.clear();
		};
	}, [ currentPostId, processAllThreads ] );

	// This component doesn't render anything visible
	return null;
}

export default BlockNoteThinkingIndicator;
