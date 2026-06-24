/**
 * Block-action helpers and module state shared by the AM provider entry
 * (`../index`) and components (e.g. ReviewMediation). Lives here to break
 * the index ↔ component import cycle.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';

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
let activeBlockFocusClientId: string | null = null;
let activeBlockFocusLayout: HTMLElement | null = null;
const FOCUS_MODE_CLASS = 'is-focus-mode';
const ROOT_BLOCK_LIST_SELECTOR = '.block-editor-block-list__layout.is-root-container';

export const BLOCK_ACTION_COMPLETE_EVENT = 'jetpack-ai-sidebar-block-action-complete';
export const SELECTED_BLOCK_CLEAR_EVENT = 'agents-manager-selected-block-cleared';

function getBlockEditorSelect(): any | null {
	try {
		const wpData = ( window as any ).wp?.data;
		if ( ! wpData?.select ) {
			return null;
		}
		return wpData.select( 'core/block-editor' ) ?? null;
	} catch {
		return null;
	}
}

function getWindowBlockEditorDispatch(): any | null {
	try {
		const wpData = ( window as any ).wp?.data;
		if ( ! wpData?.dispatch ) {
			return null;
		}
		return wpData.dispatch( 'core/block-editor' ) ?? null;
	} catch {
		return null;
	}
}

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

export function clearRememberedSelectedBlock(): void {
	rememberedSelectedBlockClientId = null;
}

export function getSelectedOrRememberedBlock(): any | null {
	const blockEditor = getBlockEditorSelect();
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

function findBlockListLayoutInDocument( doc: Document ): HTMLElement | null {
	try {
		return doc.querySelector( ROOT_BLOCK_LIST_SELECTOR ) as HTMLElement | null;
	} catch {}
	return null;
}

/**
 * Find the block-list root layout element, iframe-aware. When a reference block
 * is available, prefer the root layout that actually contains that block.
 * @param referenceElement Optional block element used to resolve the owning layout.
 * @returns The root block-list layout element, or null.
 */
export function findBlockListLayout( referenceElement?: HTMLElement | null ): HTMLElement | null {
	if ( referenceElement ) {
		const closestLayout = referenceElement.closest( ROOT_BLOCK_LIST_SELECTOR );
		if ( closestLayout ) {
			return closestLayout as HTMLElement;
		}

		const ownerLayout = findBlockListLayoutInDocument( referenceElement.ownerDocument );
		if ( ownerLayout ) {
			return ownerLayout;
		}
	}

	const el = findBlockListLayoutInDocument( document );
	if ( el ) {
		return el;
	}

	for ( const frameDocument of getAccessibleFrameDocuments() ) {
		const frameEl = findBlockListLayoutInDocument( frameDocument );
		if ( frameEl ) {
			return frameEl;
		}
	}

	return null;
}

type BlockEditorDispatch = {
	selectBlock?: ( clientId: string, initialPosition?: 0 | -1 | null ) => void;
	clearSelectedBlock?: () => void;
};

type BlockEditorSelect = {
	getSelectedBlockClientId?: () => string | null;
};

function getBlockEditorDispatch(): BlockEditorDispatch {
	try {
		return dispatch( blockEditorStore ) as BlockEditorDispatch;
	} catch {}

	return {};
}

function getSelectedBlockClientId(): string | null {
	try {
		return (
			( select( blockEditorStore ) as BlockEditorSelect )?.getSelectedBlockClientId?.() ?? null
		);
	} catch {
		return null;
	}
}

/**
 * Clear the block focus created by the sidebar. This intentionally clears the
 * selected block only when that selection still belongs to the sidebar-focused
 * block, so normal editor selections made after focus are left alone.
 */
export function clearActiveBlockFocus(): void {
	const clientId = activeBlockFocusClientId;
	const layout = activeBlockFocusLayout;
	activeBlockFocusClientId = null;
	activeBlockFocusLayout = null;

	if ( ! clientId ) {
		layout?.classList.remove( FOCUS_MODE_CLASS );
		return;
	}

	const blockEditor = getBlockEditorDispatch();
	if ( getSelectedBlockClientId() === clientId ) {
		blockEditor.clearSelectedBlock?.();
	}
	( layout ?? findBlockListLayout( findBlockElement( clientId ) ) )?.classList.remove(
		FOCUS_MODE_CLASS
	);
}

/**
 * Focus a block reference from the sidebar, or clear focus when the same
 * sidebar-owned block is clicked again.
 * @param clientId Block clientId.
 * @returns Whether the click focused or cleared the block.
 */
export function toggleBlockReferenceFocus( clientId: string ): 'focused' | 'cleared' {
	if ( activeBlockFocusClientId === clientId && getSelectedBlockClientId() === clientId ) {
		clearActiveBlockFocus();
		return 'cleared';
	}

	clearActiveBlockFocus();

	const blockEditor = getBlockEditorDispatch();
	blockEditor.selectBlock?.( clientId );
	const blockElement = findBlockElement( clientId );
	const layout = findBlockListLayout( blockElement );
	activeBlockFocusClientId = clientId;
	activeBlockFocusLayout = layout;
	blockElement?.scrollIntoView?.( { behavior: 'smooth', block: 'center' } );
	layout?.classList.add( FOCUS_MODE_CLASS );

	return 'focused';
}

/**
 * Clear sidebar-created block focus for clicks that are not block reference links.
 * @param target Event target from a sidebar click.
 */
export function clearActiveBlockFocusUnlessBlockReferenceClick( target: EventTarget | null ): void {
	if ( target instanceof Element && target.closest( '.jetpack-ai-block-ref.is-clickable' ) ) {
		return;
	}
	clearActiveBlockFocus();
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

function normaliseAttributeName( attributeName?: string | null ): string | undefined {
	return typeof attributeName === 'string' && attributeName.trim() !== ''
		? attributeName.trim()
		: undefined;
}

function getAttributeContent( block: any, attributeName?: string ): string | undefined {
	if ( ! attributeName ) {
		return undefined;
	}
	const raw = block?.attributes?.[ attributeName ];
	if ( typeof raw === 'string' ) {
		return raw;
	}
	const richTextHtml = raw?.toHTMLString?.();
	return typeof richTextHtml === 'string' ? richTextHtml : undefined;
}

function getStringLikeAttributeNames( block: any ): string[] {
	if ( ! block?.attributes || typeof block.attributes !== 'object' ) {
		return [];
	}
	return Object.keys( block.attributes ).filter(
		( attributeName ) => getAttributeContent( block, attributeName ) !== undefined
	);
}

function findAttributeByCurrentText( block: any, currentText?: string ): string | undefined {
	if ( typeof currentText !== 'string' || currentText === '' ) {
		return undefined;
	}

	const matches = getStringLikeAttributeNames( block ).filter( ( attributeName ) => {
		const content = getAttributeContent( block, attributeName ) ?? '';
		return countOccurrences( content, currentText ) === 1;
	} );

	return matches.length === 1 ? matches[ 0 ] : undefined;
}

function findAttributeByExactContent( block: any, expectedContent?: string ): string | undefined {
	if ( expectedContent === undefined ) {
		return undefined;
	}

	const matches = getStringLikeAttributeNames( block ).filter(
		( attributeName ) => getAttributeContent( block, attributeName ) === expectedContent
	);

	return matches.length === 1 ? matches[ 0 ] : undefined;
}

function resolveEditableBlockAttribute(
	block: any,
	{
		attributeName,
		currentText,
		expectedContent,
	}: { attributeName?: string; currentText?: string; expectedContent?: string } = {}
): string | undefined {
	const requestedAttribute = normaliseAttributeName( attributeName );
	if ( requestedAttribute ) {
		return getAttributeContent( block, requestedAttribute ) !== undefined
			? requestedAttribute
			: undefined;
	}

	const stringLikeAttributes = getStringLikeAttributeNames( block );

	return (
		findAttributeByCurrentText( block, currentText ) ??
		findAttributeByExactContent( block, expectedContent ) ??
		( getAttributeContent( block, 'content' ) !== undefined ? 'content' : undefined ) ??
		( stringLikeAttributes.length === 1 ? stringLikeAttributes[ 0 ] : undefined )
	);
}

export function getEditableBlockContent(
	block: any,
	attributeName?: string,
	currentText?: string
): string {
	const resolvedAttribute = resolveEditableBlockAttribute( block, { attributeName, currentText } );
	if ( ! resolvedAttribute ) {
		return '';
	}
	return getAttributeContent( block, resolvedAttribute ) ?? '';
}

export function hasEditableBlockTarget(
	block: any,
	attributeName?: string,
	currentText?: string
): boolean {
	return !! resolveEditableBlockAttribute( block, { attributeName, currentText } );
}

function getBlockSnapshot(
	clientId: string,
	attributeName?: string,
	currentText?: string,
	expectedContent?: string
): { clientId: string; name: string; content: string; attributeName?: string } | null {
	const block = getBlockEditorSelect()?.getBlock?.( clientId );
	if ( ! block ) {
		return null;
	}
	const resolvedAttribute = resolveEditableBlockAttribute( block, {
		attributeName,
		currentText,
		expectedContent,
	} );
	return {
		clientId: block.clientId ?? clientId,
		name: block.name,
		...( resolvedAttribute ? { attributeName: resolvedAttribute } : {} ),
		content: resolvedAttribute ? getEditableBlockContent( block, resolvedAttribute ) : '',
	};
}

function findBlockSnapshotByCurrentText(
	currentText: string,
	attributeName?: string
): {
	snapshot?: { clientId: string; name: string; content: string; attributeName: string };
	error?: string;
} {
	const blocks = getBlockEditorSelect()?.getBlocks?.() ?? [];
	const matches: Array< {
		clientId: string;
		name: string;
		content: string;
		attributeName: string;
	} > = [];

	const visit = ( block: any ) => {
		if ( ! block ) {
			return;
		}
		const attributeNames = attributeName
			? [ attributeName ].filter(
					( candidate ) => getAttributeContent( block, candidate ) !== undefined
			  )
			: getStringLikeAttributeNames( block );
		attributeNames.forEach( ( candidate ) => {
			if ( ! block.clientId ) {
				return;
			}
			const content = getAttributeContent( block, candidate ) ?? '';
			const snapshot = {
				clientId: block.clientId,
				name: block.name,
				attributeName: candidate,
				content,
			};
			const matchCount = countOccurrences( content, currentText );
			for ( let i = 0; i < matchCount; i++ ) {
				matches.push( snapshot );
			}
		} );

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
	const editableAttribute = normaliseAttributeName(
		input.editableAttribute ?? input.attributeName
	);
	if ( ! clientId || content === undefined || content === null ) {
		return { success: false, error: 'clientId and content are required', returnToAgent: false };
	}

	const blockEditor = getWindowBlockEditorDispatch();
	if ( ! blockEditor?.updateBlockAttributes ) {
		return { success: false, error: 'Block editor not available', returnToAgent: false };
	}
	// Let callers veto before we snapshot if the editor context has changed.
	if ( typeof shouldApply === 'function' && ! shouldApply() ) {
		return { success: false, error: 'context changed', returnToAgent: false };
	}

	const hasCurrentText = typeof currentText === 'string' && currentText !== '';
	let targetClientId = clientId;
	let snapshot = getBlockSnapshot( targetClientId, editableAttribute, currentText );
	if ( ! snapshot ) {
		if ( hasCurrentText ) {
			const fallback = findBlockSnapshotByCurrentText( currentText, editableAttribute );
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
	if ( ! snapshot.attributeName ) {
		return {
			success: false,
			error: `unsupported edit target: ${ snapshot.name }`,
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
			const latestSnapshot = getBlockSnapshot(
				targetClientId,
				snapshot?.attributeName,
				currentText
			);
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
			if ( ! latestSnapshot.attributeName ) {
				resolveFailure( `unsupported edit target: ${ latestSnapshot.name }` );
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

			try {
				blockEditor.updateBlockAttributes( targetClientId, {
					[ latestSnapshot.attributeName ]: nextContent,
				} );
				blockEditor.selectBlock?.( targetClientId );
			} catch {
				resolveFailure( 'Block editor not available' );
				return;
			}
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
				editableAttribute: latestSnapshot.attributeName,
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
 * `success: false` for unsupported edit targets so the UI can show 'failed' rather
 * than corrupting the block. On success, returns `contentBefore` so the caller can
 * pair it with `clientId` and call `undoBlockEdit` later. The optional shouldApply
 * guard lets callers abort safely if editor context changes while the edit is pending.
 */
export async function applyReviewEdit(
	clientId: string,
	content: string,
	summary?: string,
	currentText?: string,
	shouldApply?: () => boolean,
	editableAttribute?: string
): Promise< {
	success: boolean;
	clientId?: string;
	contentBefore?: string;
	contentAfter?: string;
	editableAttribute?: string;
	agentMessage?: string;
	error?: string;
	returnToAgent?: boolean;
} > {
	return handleUpdateBlockContent( {
		clientId,
		content,
		summary,
		currentText,
		shouldApply,
		editableAttribute,
	} );
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
	expectedContent?: string,
	editableAttribute?: string
): boolean {
	const blockEditor = getWindowBlockEditorDispatch();
	if ( ! blockEditor?.updateBlockAttributes ) {
		return false;
	}
	try {
		if ( expectedContent !== undefined ) {
			const snapshot = getBlockSnapshot( clientId, editableAttribute, undefined, expectedContent );
			if ( ! snapshot || snapshot.content !== expectedContent ) {
				return false;
			}
		}
		const snapshot = getBlockSnapshot( clientId, editableAttribute, undefined, expectedContent );
		if ( ! snapshot?.attributeName ) {
			return false;
		}
		blockEditor.updateBlockAttributes( clientId, {
			[ snapshot.attributeName ]: contentBefore,
		} );
		return true;
	} catch {
		return false;
	}
}
