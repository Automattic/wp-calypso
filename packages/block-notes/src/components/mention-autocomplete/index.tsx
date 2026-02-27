import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { hasAiMention, splitByAiMention } from '../../utils/content';

export const MAX_RETRIES = 5;
export const RETRY_DELAY_MS = 200;
export const PLACEHOLDER_TEXT = sprintf(
	/* translators: %s is the @ai trigger keyword/mention — do not translate */
	__( 'Leave a note. Type %s to use AI assistance.', 'big-sky' ),
	'@ai'
);

/**
 * BlockNoteMentionAutocomplete Component
 *
 * Adds placeholder text to note textareas and styles @ai mentions as pills.
 */
function BlockNoteMentionAutocomplete() {
	const attachedTextareasRef = useRef( new Set< HTMLTextAreaElement >() );
	const retryTimeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	const { currentPostId } = useSelect( ( select ) => {
		const postId = select( editorStore ).getCurrentPostId();
		return {
			currentPostId: postId,
		};
	}, [] );

	/**
	 * Attach placeholder to a textarea
	 * @param textarea - The textarea element to attach placeholder to
	 */
	const attachTextarea = useCallback( ( textarea: HTMLTextAreaElement ) => {
		if ( attachedTextareasRef.current.has( textarea ) ) {
			return;
		}

		// Add placeholder text to guide users
		if ( ! textarea.placeholder ) {
			textarea.placeholder = PLACEHOLDER_TEXT;
		}

		attachedTextareasRef.current.add( textarea );
	}, [] );

	/**
	 * Find and attach to all block notes textareas
	 */
	const attachToTextareas = useCallback(
		( attempt = 1 ) => {
			// Clear any existing timeout before proceeding
			if ( retryTimeoutRef.current ) {
				clearTimeout( retryTimeoutRef.current );
				retryTimeoutRef.current = null;
			}

			// Find all textareas in block notes
			const textareas = document.querySelectorAll( 'textarea[id^="comment-input-"]' );

			if ( textareas.length === 0 && attempt < MAX_RETRIES ) {
				// Store timeout ID for cleanup
				retryTimeoutRef.current = setTimeout( () => {
					attachToTextareas( attempt + 1 );
				}, RETRY_DELAY_MS );
				return;
			}

			textareas.forEach( ( textarea ) => {
				attachTextarea( textarea as HTMLTextAreaElement );
			} );
		},
		[ attachTextarea ]
	);

	/**
	 * Wrap mentions in rendered notes with pill styling
	 */
	const styleMentionsInNotes = useCallback( () => {
		// Find all notes content elements
		// Target the specific div structure for WordPress block notes
		const noteElements = document.querySelectorAll( '.editor-collab-sidebar-panel__user-comment' );

		noteElements.forEach( ( el ) => {
			const element = el as HTMLElement;
			// Skip if already processed
			if ( element.dataset.mentionsStyled === 'true' ) {
				return;
			}

			// Skip if element doesn't have text content with mentions
			if ( ! element.textContent || ! hasAiMention( element.textContent ) ) {
				return;
			}

			// Get text nodes and replace mentions with styled spans
			const walker = document.createTreeWalker( element, window.NodeFilter.SHOW_TEXT, null );

			const nodesToReplace: Node[] = [];
			let node: Node | null;

			while ( ( node = walker.nextNode() ) ) {
				const text = node.nodeValue;
				// Match @ai
				if ( text && hasAiMention( text ) ) {
					nodesToReplace.push( node );
				}
			}

			// Replace text nodes with styled content
			nodesToReplace.forEach( ( textNode ) => {
				const text = textNode.nodeValue;
				const fragment = document.createDocumentFragment();

				if ( ! text ) {
					return;
				}
				// Split by mentions and create styled spans
				const parts = splitByAiMention( text );

				parts.forEach( ( part ) => {
					if ( hasAiMention( part ) ) {
						const span = document.createElement( 'span' );
						span.className = 'bigsky-mention-pill';
						span.textContent = part;
						fragment.appendChild( span );
					} else if ( part ) {
						fragment.appendChild( document.createTextNode( part ) );
					}
				} );

				if ( textNode.parentNode ) {
					textNode.parentNode.replaceChild( fragment, textNode );
				}
			} );

			// Mark as processed
			element.dataset.mentionsStyled = 'true';
		} );
	}, [] );

	// Setup effect
	useEffect( () => {
		if ( ! currentPostId ) {
			return;
		}

		// Inject Block Note component-specific styles
		const styleId = 'bigsky-mention-autocomplete-styles';
		const existingStyle = document.getElementById( styleId );

		if ( ! existingStyle ) {
			const styleElement = document.createElement( 'style' );
			styleElement.id = styleId;
			styleElement.textContent = `
				.bigsky-mention-pill {
					display: inline-block;
					background-color: #3858e9;
					color: #fff;
					padding: 2px 8px;
					border-radius: 12px;
					font-weight: 500;
					font-size: 0.9em;
					text-decoration: none;
				}
				.bigsky-mention-pill:hover {
					background-color: #2145e6;
					color: #fff;
				}
			`;
			document.head.appendChild( styleElement );
		}

		// Initial attachment
		attachToTextareas();

		// Initial mention styling
		styleMentionsInNotes();

		// Use MutationObserver to detect new textareas and notes
		const observer = new window.MutationObserver( () => {
			attachToTextareas();
			styleMentionsInNotes();
		} );

		observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );

		// Store current ref value for cleanup
		const currentAttachedTextareas = attachedTextareasRef.current;

		// Cleanup
		return () => {
			observer.disconnect();

			// Clear any pending retry timeout
			if ( retryTimeoutRef.current ) {
				clearTimeout( retryTimeoutRef.current );
			}

			currentAttachedTextareas.clear();
		};
	}, [ currentPostId, attachToTextareas, styleMentionsInNotes ] );

	// This component doesn't render anything visible
	return null;
}

export default BlockNoteMentionAutocomplete;
