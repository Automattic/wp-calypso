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

/** Inject processing-effect styles. Uses system fonts so no external font fetch is needed. */
function ensureProcessingStyles( doc: Document ): void {
	if ( doc.getElementById( 'jetpack-ai-processing-styles' ) ) {
		return;
	}
	const style = doc.createElement( 'style' );
	style.id = 'jetpack-ai-processing-styles';
	style.textContent = `
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
			font-style: italic;
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

/** Block types whose `content` attribute can be safely replaced by a plain text/HTML string. */
export const SUPPORTED_EDIT_BLOCK_TYPES = [ 'core/paragraph', 'core/heading' ] as const;

export function isSupportedEditBlockType( blockName?: string | null ): boolean {
	return (
		typeof blockName === 'string' &&
		( SUPPORTED_EDIT_BLOCK_TYPES as readonly string[] ).includes( blockName )
	);
}

function countOccurrences( source: string, needle: string ): number {
	if ( needle === '' ) {
		return 0;
	}
	let count = 0;
	let startIndex = 0;
	while ( true ) {
		const index = source.indexOf( needle, startIndex );
		if ( index === -1 ) {
			return count;
		}
		count++;
		startIndex = index + 1;
	}
}

function getBlockSnapshot( clientId: string ): { name: string; content: string } | null {
	const block = ( window as any ).wp?.data?.select( 'core/block-editor' )?.getBlock?.( clientId );
	if ( ! block ) {
		return null;
	}
	const raw = block.attributes?.content;
	const content = typeof raw === 'string' ? raw : raw?.toHTMLString?.() ?? '';
	return { name: block.name, content };
}

/**
 * Handle the update-block-content tool call: apply text changes to a block.
 * @param {any} input - Tool input with clientId, content, and optional summary / currentText.
 * @returns Result with success flag and (on success) the pre-edit `contentBefore`
 *   so callers can revert later via `undoBlockEdit`.
 */
export function handleUpdateBlockContent( input: any ): any {
	const { clientId, content, summary, currentText } = input;
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

	const snapshot = getBlockSnapshot( clientId );
	if ( ! snapshot ) {
		return { success: false, error: 'block not found', returnToAgent: false };
	}
	if ( ! isSupportedEditBlockType( snapshot.name ) ) {
		return {
			success: false,
			error: `unsupported block type: ${ snapshot.name }`,
			returnToAgent: false,
		};
	}

	// Substring replace when currentText is a non-empty span present in the block.
	// If that span no longer exists, fail rather than replacing the whole block
	// with a partial suggested edit.
	const hasCurrentText = typeof currentText === 'string' && currentText !== '';
	if ( hasCurrentText ) {
		const matchCount = countOccurrences( snapshot.content, currentText );
		if ( matchCount === 0 ) {
			// eslint-disable-next-line no-console
			console.warn( '[ReviewMediation] currentText not found in block content', { clientId } );
			return {
				success: false,
				error: 'currentText not found in block content',
				returnToAgent: false,
			};
		}
		if ( matchCount > 1 ) {
			// eslint-disable-next-line no-console
			console.warn( '[ReviewMediation] currentText matches multiple spans in block content', {
				clientId,
			} );
			return {
				success: false,
				error: 'currentText matches multiple spans in block content',
				returnToAgent: false,
			};
		}
	}

	// Apply shimmer briefly, then update content and show highlight
	const blockEl = findBlockElement( clientId );
	if ( blockEl ) {
		applyProcessingEffect( blockEl );
	}

	// Short delay so the shimmer is visible before content swaps
	return new Promise< any >( ( resolve ) => {
		setTimeout( () => {
			const latestSnapshot = getBlockSnapshot( clientId );
			const resolveFailure = ( error: string ) => {
				if ( blockEl ) {
					removeProcessingEffect( blockEl );
				}
				resolve( { success: false, error, returnToAgent: false } );
			};

			if ( ! latestSnapshot ) {
				resolveFailure( 'block not found' );
				return;
			}
			if ( ! isSupportedEditBlockType( latestSnapshot.name ) ) {
				resolveFailure( `unsupported block type: ${ latestSnapshot.name }` );
				return;
			}

			let nextContent = content;
			if ( hasCurrentText ) {
				const matchCount = countOccurrences( latestSnapshot.content, currentText );
				if ( matchCount === 0 ) {
					// eslint-disable-next-line no-console
					console.warn( '[ReviewMediation] currentText not found in block content', { clientId } );
					resolveFailure( 'currentText not found in block content' );
					return;
				}
				if ( matchCount > 1 ) {
					// eslint-disable-next-line no-console
					console.warn( '[ReviewMediation] currentText matches multiple spans in block content', {
						clientId,
					} );
					resolveFailure( 'currentText matches multiple spans in block content' );
					return;
				}
				nextContent = latestSnapshot.content.replace( currentText, content );
			} else if ( latestSnapshot.content !== snapshot.content ) {
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] block content changed while applying edit', { clientId } );
				resolveFailure( 'block content changed while applying edit' );
				return;
			}

			blockEditor.updateBlockAttributes( clientId, { content: nextContent } );

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

			resolve( {
				success: true,
				contentBefore: latestSnapshot.content,
				contentAfter: nextContent,
				returnToAgent: false,
			} );
		}, 800 );
	} );
}

/**
 * Apply a mediation-suggested edit. When `currentText` is provided and uniquely
 * matches a span in the block, only that span is replaced. When it is missing or
 * ambiguous, the edit fails safely rather than replacing the whole block. Returns
 * `success: false` for unsupported block types so the UI can show 'failed' rather
 * than corrupting the block. On success, returns `contentBefore` so the caller can
 * pair it with `clientId` and call `undoBlockEdit` later.
 */
export async function applyReviewEdit(
	clientId: string,
	content: string,
	summary?: string,
	currentText?: string
): Promise< {
	success: boolean;
	contentBefore?: string;
	contentAfter?: string;
	error?: string;
	returnToAgent?: boolean;
} > {
	return handleUpdateBlockContent( { clientId, content, summary, currentText } );
}

/**
 * Revert a block's content to a pre-accept snapshot. Used by ReviewMediation's
 * per-card Undo to actually undo the mutation, not just flip UI state.
 * When `expectedContent` is supplied, only restore if the block still contains
 * the content this row applied. This avoids clobbering later accepted edits on
 * the same block.
 */
export function undoBlockEdit(
	clientId: string,
	contentBefore: string,
	expectedContent?: string
): boolean {
	const blockEditor = ( window as any ).wp?.data?.dispatch?.( 'core/block-editor' );
	if ( ! blockEditor?.updateBlockAttributes ) {
		return false;
	}
	try {
		if ( expectedContent !== undefined ) {
			const snapshot = getBlockSnapshot( clientId );
			if ( ! snapshot || snapshot.content !== expectedContent ) {
				return false;
			}
		}
		blockEditor.updateBlockAttributes( clientId, { content: contentBefore } );
		return true;
	} catch {
		return false;
	}
}
