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

let moduleCheckpointApi: CheckpointApi | null = null;
const processingEffectTimeouts = new WeakMap< HTMLElement, ReturnType< typeof setTimeout > >();
const processingEffectElements = new Set< HTMLElement >();
let rememberedSelectedBlockClientId: string | null = null;

export const BLOCK_ACTION_COMPLETE_EVENT = 'jetpack-ai-sidebar-block-action-complete';

export function setModuleCheckpointApi( api: CheckpointApi | null ): void {
	moduleCheckpointApi = api;
}

export function getModuleCheckpointApi(): CheckpointApi | null {
	return moduleCheckpointApi;
}

export function rememberSelectedBlock( block: any ): void {
	if ( block?.clientId ) {
		rememberedSelectedBlockClientId = block.clientId;
	}
}

export function getSelectedOrRememberedBlock(): any | null {
	const blockEditor = ( window as any ).wp?.data?.select( 'core/block-editor' );
	const selectedBlock = blockEditor?.getSelectedBlock?.();
	if ( selectedBlock?.clientId ) {
		rememberSelectedBlock( selectedBlock );
		return selectedBlock;
	}

	return rememberedSelectedBlockClientId
		? blockEditor?.getBlock?.( rememberedSelectedBlockClientId )
		: null;
}

export function notifyBlockActionComplete(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.dispatchEvent( new Event( BLOCK_ACTION_COMPLETE_EVENT ) );
}

function clearProcessingEffectTimeout( el: HTMLElement ): void {
	const timeout = processingEffectTimeouts.get( el );
	if ( timeout ) {
		clearTimeout( timeout );
		processingEffectTimeouts.delete( el );
	}
}

// ---------- Block element helpers ----------

function getAccessibleFrameDocuments(): Document[] {
	const docs: Document[] = [];
	document.querySelectorAll( 'iframe' ).forEach( ( iframe ) => {
		try {
			const frameDocument = ( iframe as HTMLIFrameElement ).contentDocument;
			if ( frameDocument ) {
				docs.push( frameDocument );
			}
		} catch {
			// Cross-origin frames are not relevant to the block editor.
		}
	} );
	return docs;
}

/**
 * Find a block element by clientId in the main document or editor iframe.
 * Exported so peer components (e.g. ReviewMediation) can scroll a block into
 * view on interaction.
 * @param {string} clientId - The block's clientId.
 * @returns The block element, or null.
 */
export function findBlockElement( clientId: string ): HTMLElement | null {
	if ( ! clientId ) {
		return null;
	}

	const selector = `[data-block="${ CSS.escape( clientId ) }"]`;
	try {
		const el = document.querySelector( selector ) as HTMLElement | null;
		if ( el ) {
			return el;
		}
		for ( const frameDocument of getAccessibleFrameDocuments() ) {
			const frameEl = frameDocument.querySelector( selector ) as HTMLElement | null;
			if ( frameEl ) {
				return frameEl;
			}
		}
	} catch {}
	return null;
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
		for ( const frameDocument of getAccessibleFrameDocuments() ) {
			const frameEl = frameDocument.querySelector( selector ) as HTMLElement | null;
			if ( frameEl ) {
				return frameEl;
			}
		}
	} catch {}
	return null;
}

// ---------- Processing effect (Flow Block shimmer) ----------

/** Inject processing-effect styles, matching Big Sky's Flow Block shimmer. */
function ensureProcessingStyles( doc: Document ): void {
	if ( doc.getElementById( 'jetpack-ai-processing-styles' ) ) {
		return;
	}
	const style = doc.createElement( 'style' );
	style.id = 'jetpack-ai-processing-styles';
	style.textContent = `
		@import url(https://fonts.googleapis.com/css2?family=Flow+Block&display=swap);

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
			.jetpack-ai-is-processing .wp-block-paragraph,
			.jetpack-ai-is-processing-content,
			.jetpack-ai-is-processing-content .wp-block-heading,
			.jetpack-ai-is-processing-content .wp-block-paragraph,
			.big-sky__is-processing-content,
			.big-sky__is-processing-content .wp-block-heading,
			.big-sky__is-processing-content .wp-block-paragraph {
				font-family: "Flow Block", system-ui !important;
				font-weight: 200;
				font-style: normal;
				transition: transform 1s;
			}
			.jetpack-ai-is-processing div,
			.jetpack-ai-is-processing-content div,
			.big-sky__is-processing-content div {
				font-family: "Flow Block", system-ui !important;
				font-weight: 200;
				font-style: normal;
				overflow: hidden;
			}
			.jetpack-ai-is-processing:not(:has(img)),
			.jetpack-ai-is-processing-content:not(:has(img)),
			.big-sky__is-processing-content:not(:has(img)) {
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

function removeProcessingClasses( el: HTMLElement ): void {
	el.classList.remove( 'jetpack-ai-is-processing' );
	el.classList.remove( 'jetpack-ai-is-processing-content' );
	el.classList.remove( 'big-sky__is-processing-content' );
	delete el.dataset.bigSkyProcessingState;
	delete el.dataset.bigSkyProcessingFeatures;
	processingEffectElements.delete( el );
}

function clearProcessingEffect( el: HTMLElement ): void {
	clearProcessingEffectTimeout( el );
	removeProcessingClasses( el );
}

/**
 * Apply processing effect to a block element.
 * @param el - The block element.
 */
export function applyProcessingEffect( el: HTMLElement ): void {
	ensureProcessingStyles( el.ownerDocument );
	clearProcessingEffectTimeout( el );
	el.classList.add( 'jetpack-ai-is-processing' );
	el.classList.add( 'jetpack-ai-is-processing-content' );
	el.classList.add( 'big-sky__is-processing-content' );
	el.dataset.bigSkyProcessingState = 'processing';
	el.dataset.bigSkyProcessingFeatures = 'content';
	processingEffectElements.add( el );
	processingEffectTimeouts.set(
		el,
		setTimeout( () => {
			clearProcessingEffect( el );
		}, 30000 )
	);
}

/**
 * Remove processing effect and show a brief highlight.
 * @param el - The block element.
 */
function removeProcessingEffect( el: HTMLElement ): void {
	clearProcessingEffect( el );
	el.classList.add( 'jetpack-ai-has-processed' );
	setTimeout( () => {
		el.classList.remove( 'jetpack-ai-has-processed' );
	}, 1000 );
}

/**
 * Stop shimmer on any block currently marked as processing.
 */
export function stopBlockShimmer(): void {
	Array.from( processingEffectElements ).forEach( clearProcessingEffect );
}

/**
 * Start shimmer on the currently selected block (if any).
 */
export function startBlockShimmer(): void {
	const wpData = ( window as any ).wp?.data;
	if ( ! wpData ) {
		return;
	}
	const block = getSelectedOrRememberedBlock();
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

function getEditableBlockContent( block: any ): string {
	const raw = block.attributes?.content;
	return typeof raw === 'string' ? raw : raw?.toHTMLString?.() ?? '';
}

function getBlockSnapshot(
	clientId: string
): { clientId: string; name: string; content: string } | null {
	const block = ( window as any ).wp?.data?.select( 'core/block-editor' )?.getBlock?.( clientId );
	if ( ! block ) {
		return null;
	}
	return {
		clientId: block.clientId ?? clientId,
		name: block.name,
		content: getEditableBlockContent( block ),
	};
}

function findBlockSnapshotByCurrentText( currentText: string ): {
	snapshot?: { clientId: string; name: string; content: string };
	error?: string;
} {
	const blocks = ( window as any ).wp?.data?.select( 'core/block-editor' )?.getBlocks?.() ?? [];
	const matches: Array< { clientId: string; name: string; content: string } > = [];

	const visit = ( block: any ) => {
		if ( ! block ) {
			return;
		}
		const snapshot = {
			clientId: block.clientId,
			name: block.name,
			content: getEditableBlockContent( block ),
		};

		if ( snapshot.clientId && isSupportedEditBlockType( snapshot.name ) ) {
			const matchCount = countOccurrences( snapshot.content, currentText );
			for ( let i = 0; i < matchCount; i++ ) {
				matches.push( snapshot );
			}
		}

		( block.innerBlocks ?? [] ).forEach( visit );
	};

	blocks.forEach( visit );

	if ( matches.length === 1 ) {
		return { snapshot: matches[ 0 ] };
	}
	if ( matches.length > 1 ) {
		return { error: 'currentText matches multiple spans in block content' };
	}
	return {};
}

/**
 * Handle the update-block-content tool call: apply text changes to a block.
 * @param {any} input - Tool input with clientId, content, optional summary / currentText,
 *   and optional shouldApply guard. When shouldApply returns false before either the
 *   initial snapshot or delayed write, the edit fails with "context changed" without
 *   mutating the block.
 * @returns Result with success flag and (on success) the pre-edit `contentBefore`
 *   so callers can revert later via `undoBlockEdit`.
 */
export function handleUpdateBlockContent( input: any ): any {
	const { clientId, content, summary, currentText, shouldApply } = input;
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
	// Let callers veto before we snapshot if the editor context has changed.
	if ( typeof shouldApply === 'function' && ! shouldApply() ) {
		return { success: false, error: 'context changed', returnToAgent: false };
	}

	const hasCurrentText = typeof currentText === 'string' && currentText !== '';
	let targetClientId = clientId;
	let snapshot = getBlockSnapshot( targetClientId );
	if ( ! snapshot ) {
		if ( hasCurrentText ) {
			const fallback = findBlockSnapshotByCurrentText( currentText );
			if ( fallback.error ) {
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] currentText matches multiple spans in block content', {
					clientId,
				} );
				return {
					success: false,
					error: fallback.error,
					returnToAgent: false,
				};
			}
			if ( fallback.snapshot ) {
				targetClientId = fallback.snapshot.clientId;
				snapshot = fallback.snapshot;
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] stale clientId matched by currentText', {
					clientId,
					targetClientId,
				} );
			}
		}

		if ( ! snapshot ) {
			return { success: false, error: 'block not found', returnToAgent: false };
		}
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
	const blockEl = findBlockElement( targetClientId );
	if ( blockEl ) {
		applyProcessingEffect( blockEl );
	}

	// Short delay so the shimmer is visible before content swaps
	return new Promise< any >( ( resolve ) => {
		setTimeout( () => {
			const latestSnapshot = getBlockSnapshot( targetClientId );
			const resolveFailure = ( error: string ) => {
				if ( blockEl ) {
					removeProcessingEffect( blockEl );
				}
				notifyBlockActionComplete();
				resolve( { success: false, error, returnToAgent: false } );
			};

			// Re-check immediately before mutation because the shimmer intentionally delays writes.
			if ( typeof shouldApply === 'function' && ! shouldApply() ) {
				resolveFailure( 'context changed' );
				return;
			}
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
					console.warn( '[ReviewMediation] currentText not found in block content', {
						clientId: targetClientId,
					} );
					resolveFailure( 'currentText not found in block content' );
					return;
				}
				if ( matchCount > 1 ) {
					// eslint-disable-next-line no-console
					console.warn( '[ReviewMediation] currentText matches multiple spans in block content', {
						clientId: targetClientId,
					} );
					resolveFailure( 'currentText matches multiple spans in block content' );
					return;
				}
				nextContent = latestSnapshot.content.replace( currentText, content );
			} else if ( latestSnapshot.content !== snapshot.content ) {
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] block content changed while applying edit', {
					clientId: targetClientId,
				} );
				resolveFailure( 'block content changed while applying edit' );
				return;
			}

			blockEditor.updateBlockAttributes( targetClientId, { content: nextContent } );
			blockEditor.selectBlock?.( targetClientId );
			rememberedSelectedBlockClientId = targetClientId;

			if ( blockEl ) {
				removeProcessingEffect( blockEl );
			}

			notifyBlockActionComplete();

			resolve( {
				success: true,
				clientId: targetClientId,
				contentBefore: latestSnapshot.content,
				contentAfter: nextContent,
				returnToAgent: false,
				...( summary ? { agentMessage: summary } : {} ),
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
 * pair it with `clientId` and call `undoBlockEdit` later. The optional shouldApply
 * guard lets callers abort safely if editor context changes while the edit is pending.
 */
export async function applyReviewEdit(
	clientId: string,
	content: string,
	summary?: string,
	currentText?: string,
	shouldApply?: () => boolean
): Promise< {
	success: boolean;
	clientId?: string;
	contentBefore?: string;
	contentAfter?: string;
	agentMessage?: string;
	error?: string;
	returnToAgent?: boolean;
} > {
	return handleUpdateBlockContent( { clientId, content, summary, currentText, shouldApply } );
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
