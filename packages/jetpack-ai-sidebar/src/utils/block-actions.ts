/**
 * Block-action helpers and module state shared by the AM provider entry
 * (`../index`) and components (e.g. ReviewMediation). Lives here to break
 * the index ↔ component import cycle.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Checkpoint API shared between the React `useCheckpoint` hook (which AM
 * calls) and the synchronous `handleShowComponent` callback.
 */
export interface CheckpointApi {
	setCheckpoint: ( id: string ) => void;
	hasCheckpoint: ( id: string ) => boolean;
	restoreCheckpoint: ( id: string ) => Promise< void >;
}

// ---------- Module state ----------

let addMessageFn: ( ( message: any ) => void ) | null = null;
let moduleCheckpointApi: CheckpointApi | null = null;

export function setAddMessageFn( fn: ( ( message: any ) => void ) | null ): void {
	addMessageFn = fn;
}

export function setModuleCheckpointApi( api: CheckpointApi | null ): void {
	moduleCheckpointApi = api;
}

export function getModuleCheckpointApi(): CheckpointApi | null {
	return moduleCheckpointApi;
}

// ---------- Block element helpers ----------

/**
 * Find a block element by clientId in the main document or editor iframe.
 * Exported so peer components (e.g. ReviewMediation) can scroll a block into
 * view on interaction.
 * @param {string} clientId - The block's clientId.
 * @returns The block element, or null.
 */
export function findBlockElement( clientId: string ): HTMLElement | null {
	// Validate clientId format to prevent selector injection.
	if ( ! /^[0-9a-f-]+$/i.test( clientId ) ) {
		return null;
	}

	try {
		const el = document.querySelector( `[data-block="${ clientId }"]` ) as HTMLElement | null;
		if ( el ) {
			return el;
		}
		const iframe = document.querySelector(
			'iframe[name="editor-canvas"]'
		) as HTMLIFrameElement | null;
		return (
			( iframe?.contentDocument?.querySelector(
				`[data-block="${ clientId }"]`
			) as HTMLElement | null ) ?? null
		);
	} catch {
		return null;
	}
}

/**
 * Find the block-list root layout element, iframe-aware. Exposed so peer
 * components can toggle Gutenberg's `.is-focus-mode` class to mirror the
 * block-notes "dim other blocks" UX.
 * @returns The root block-list layout element, or null.
 */
export function findBlockListLayout(): HTMLElement | null {
	const selector = '.block-editor-block-list__layout.is-root-container';
	try {
		const el = document.querySelector( selector ) as HTMLElement | null;
		if ( el ) {
			return el;
		}
		const iframe = document.querySelector(
			'iframe[name="editor-canvas"]'
		) as HTMLIFrameElement | null;
		return ( iframe?.contentDocument?.querySelector( selector ) as HTMLElement | null ) ?? null;
	} catch {
		return null;
	}
}

// ---------- Processing effect (Flow Block shimmer) ----------

/**
 * Inject processing styles into the document containing the block.
 * Uses Flow Block font + flash animation matching Big Sky's effect.
 * @param doc
 */
function ensureProcessingStyles( doc: Document ): void {
	if ( doc.getElementById( 'jetpack-ai-processing-styles' ) ) {
		return;
	}
	const style = doc.createElement( 'style' );
	style.id = 'jetpack-ai-processing-styles';
	style.textContent = `
		@import url("https://fonts.googleapis.com/css2?family=Flow+Block&display=swap");
		@keyframes jetpack-ai-flash-text {
			0% { opacity: 0.4; }
			50% { opacity: 0.8; }
			100% { opacity: 0.4; }
		}
		@keyframes jetpack-ai-highlight-fade {
			0% { outline-color: rgba(56, 88, 233, 0.8); }
			100% { outline-color: transparent; }
		}
		.jetpack-ai-is-processing,
		.jetpack-ai-is-processing .wp-block-heading,
		.jetpack-ai-is-processing .wp-block-paragraph {
			font-family: "Flow Block", system-ui !important;
			font-style: normal;
			font-weight: 200;
			transition: transform 1s;
		}
		.jetpack-ai-is-processing:not(:has(img)) {
			animation: jetpack-ai-flash-text 2s infinite;
		}
		.jetpack-ai-has-processed {
			outline: 2px solid rgba(56, 88, 233, 0.8);
			outline-offset: 2px;
			border-radius: 4px;
			animation: jetpack-ai-highlight-fade 1s ease-out forwards;
		}
	`;
	doc.head.appendChild( style );
}

/**
 * Apply processing effect to a block element.
 * @param el - The block element.
 */
export function applyProcessingEffect( el: HTMLElement ): void {
	ensureProcessingStyles( el.ownerDocument );
	el.classList.add( 'jetpack-ai-is-processing' );
}

/**
 * Remove processing effect and show a brief highlight.
 * @param el - The block element.
 */
function removeProcessingEffect( el: HTMLElement ): void {
	el.classList.remove( 'jetpack-ai-is-processing' );
	el.classList.add( 'jetpack-ai-has-processed' );
	setTimeout( () => {
		el.classList.remove( 'jetpack-ai-has-processed' );
	}, 1000 );
}

/**
 * Start shimmer on the currently selected block (if any).
 */
export function startBlockShimmer(): void {
	const wpData = ( window as any ).wp?.data;
	if ( ! wpData ) {
		return;
	}
	const block = wpData.select( 'core/block-editor' ).getSelectedBlock();
	if ( block?.clientId ) {
		const blockEl = findBlockElement( block.clientId );
		if ( blockEl ) {
			applyProcessingEffect( blockEl );
		}
	}
}

// ---------- Ability callbacks ----------

/**
 * Handle the update-block-content tool call: apply text changes to a block.
 * @param {any} input - Tool input with clientId, content, and optional summary.
 * @returns {Object} Result with returnToAgent: false.
 */
export function handleUpdateBlockContent( input: any ): any {
	const { clientId, content, summary } = input;
	if ( ! clientId || content === undefined || content === null ) {
		return { success: false, error: 'clientId and content are required', returnToAgent: false };
	}

	const wpData = ( window as any ).wp?.data;
	if ( ! wpData ) {
		return { success: false, error: 'WordPress data not available', returnToAgent: false };
	}

	const blockEditor = wpData.dispatch( 'core/block-editor' );
	if ( ! blockEditor ) {
		return { success: false, error: 'Block editor not available', returnToAgent: false };
	}

	// Apply shimmer briefly, then update content and show highlight
	const blockEl = findBlockElement( clientId );
	if ( blockEl ) {
		applyProcessingEffect( blockEl );
	}

	// Short delay so the shimmer is visible before content swaps
	return new Promise< any >( ( resolve ) => {
		setTimeout( () => {
			blockEditor.updateBlockAttributes( clientId, { content } );

			if ( blockEl ) {
				removeProcessingEffect( blockEl );
			}

			// Show summary in chat
			if ( addMessageFn && summary ) {
				addMessageFn( {
					id: `block-update-${ Date.now() }`,
					role: 'assistant',
					content: [ { type: 'text', text: summary } ],
					created_at: Math.floor( Date.now() / 1000 ),
					showIcon: true,
				} );
			}

			resolve( { success: true, returnToAgent: false } );
		}, 800 );
	} );
}

/**
 * Apply a mediation-suggested edit to a block. Snapshots a checkpoint so AM's
 * Undo can restore the pre-edit state, then delegates to handleUpdateBlockContent.
 * ReviewMediation omits `summary` to keep the mediation card as `isLastMessage`.
 * @param {string}             clientId - Target block's clientId.
 * @param {string}             content  - The new content to apply.
 * @param {string | undefined} summary  - Optional rationale; when provided, posted to chat.
 * @returns {Promise<{success: boolean, error?: string}>} The `handleUpdateBlockContent` result.
 */
export async function applyReviewEdit(
	clientId: string,
	content: string,
	summary?: string
): Promise< { success: boolean; error?: string; returnToAgent?: boolean } > {
	const checkpointId = `review-edit-${ Date.now() }`;
	moduleCheckpointApi?.setCheckpoint( checkpointId );
	return handleUpdateBlockContent( { clientId, content, summary } );
}
