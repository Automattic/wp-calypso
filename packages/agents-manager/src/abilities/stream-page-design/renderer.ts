/**
 * Paints a page design into the canvas as it streams: each complete top-level
 * block is placed as it arrives; a block still open shows as a preview whose
 * complete children are placed under it, and is replaced by the repaired block
 * when it closes. The editor is reached only through `host`.
 */

import { createBlock } from '@wordpress/blocks';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import {
	extractCompleteTopLevelBlock,
	parseBlockComment,
	repairBlocksFromMarkup,
} from './block-markup';
import { addPreviewClass, ensurePreviewStyles, scrollToBlockBottom } from './preview';
import {
	getPageSectionMarkup,
	getStreamedMarkup,
	setStreamHandler,
	type StreamUpdate,
} from './stream';
import type { EditorBlock } from '../../utils/editor-blocks';

export interface EditorHost {
	/** Where top-level blocks go, or `null` while the canvas is still mounting. */
	resolveRoot: () => string | null;
	/** Replaces the blocks under `rootClientId`, outside the undo stack. */
	stageBlocks: ( rootClientId: string, blocks: EditorBlock[] ) => void;
	/** Snapshots the page once per stream, before its first frame. */
	captureCheckpoint: ( toolCallId: string, rootClientId: string ) => void;
	/** Folds the finished design into one native undo level. */
	commitFinalDesign: ( toolCallId: string, rootClientId: string ) => void;
}

// Deltas arrive a few characters at a time; re-rendering the page on each would
// starve the canvas of the main thread it needs to mount.
const FLUSH_INTERVAL_MS = 150;
// The canvas mounts after the chat, so an early flush may find nowhere to stage.
const MAX_FLUSH_RETRIES = 20;
// Following every nested container would scroll on almost every frame.
const NESTED_CONTAINER_SCROLL_INTERVAL = 3;

const CONTAINER_BLOCK_NAMES = [
	'core/buttons',
	'core/column',
	'core/columns',
	'core/cover',
	'core/details',
	'core/group',
	'core/media-text',
	'core/navigation',
	'core/query',
	'core/query-no-results',
	'core/query-pagination',
	'core/query-pagination-numbers',
	'core/query-title',
	'core/social-links',
	'core/stack',
	'wpcom/site-section',
];

// A block whose closing delimiter has not arrived: its preview on the canvas,
// and what has come in of its inner markup.
interface OpenBlock {
	clientId: string;
	markup: string;
	childBlocks: EditorBlock[];
	openChild: OpenBlock | null;
	innerBuffer: string;
	lastInnerMarkup: string;
	isContainer: boolean;
	didQueueContainerScroll: boolean;
	scrolledAfterFirstContent: boolean;
	nestedContainerScrollCount: number;
}

interface ToolCallState {
	topLevelBlocks: EditorBlock[];
	openBlock: OpenBlock | null;
	pageBuffer: string;
	lastPageContent: string;
	didReplaceInitialContent: boolean;
}

const createOpenBlock = ( clientId: string, markup: string, isContainer = false ): OpenBlock => ( {
	clientId,
	markup,
	childBlocks: [],
	openChild: null,
	innerBuffer: '',
	lastInnerMarkup: '',
	isContainer,
	didQueueContainerScroll: false,
	scrolledAfterFirstContent: false,
	nestedContainerScrollCount: 0,
} );

const createToolCallState = (): ToolCallState => ( {
	topLevelBlocks: [],
	openBlock: null,
	pageBuffer: '',
	lastPageContent: '',
	didReplaceInitialContent: false,
} );

// The first opening block delimiter in the buffer, parsed, with the markup after it.
function findOpeningDelimiter( buffer: string ) {
	const open = /<!--\s*wp:[\s\S]*?-->/.exec( buffer );
	const comment = open && parseBlockComment( open[ 0 ] );

	return open && comment && ! comment.isSelfClosing
		? { comment, index: open.index, rest: buffer.slice( open.index + open[ 0 ].length ) }
		: null;
}

const startsWithOpenDelimiter = ( buffer: string ): boolean => {
	const open = findOpeningDelimiter( buffer );

	return !! open && ! buffer.slice( 0, open.index ).trim();
};

/** The markup after an open block's delimiter. */
const getInnerMarkup = ( openBlockMarkup: string ): string =>
	findOpeningDelimiter( openBlockMarkup )?.rest ?? '';

// An empty block from the open delimiter alone, marked as a preview.
function createPreviewBlock( buffer: string ): { block: EditorBlock; markup: string } | null {
	const open = findOpeningDelimiter( buffer );

	if ( ! open ) {
		return null;
	}

	try {
		return {
			block: createBlock(
				open.comment.blockName,
				addPreviewClass( open.comment.attributes ),
				[]
			) as EditorBlock,
			markup: buffer.slice( open.index ),
		};
	} catch {
		return null;
	}
}

function lastContainerClientId( blocks: EditorBlock[] ): string | null {
	for ( let index = blocks.length - 1; index >= 0; index-- ) {
		const block = blocks[ index ];
		const nested = lastContainerClientId( block.innerBlocks );

		if ( nested ) {
			return nested;
		}

		if ( block.innerBlocks.length ) {
			return block.clientId;
		}
	}

	return null;
}

function nextContainerScrollTarget( root: OpenBlock, clientId: string | null ): string | null {
	if ( ! clientId ) {
		return null;
	}

	root.nestedContainerScrollCount += 1;

	return root.nestedContainerScrollCount % NESTED_CONTAINER_SCROLL_INTERVAL === 0 ? clientId : null;
}

function containerScrollTarget( root: OpenBlock, openBlock: OpenBlock ): string | null {
	if (
		openBlock.didQueueContainerScroll ||
		( ! openBlock.isContainer && ! openBlock.childBlocks.length )
	) {
		return null;
	}

	openBlock.didQueueContainerScroll = true;

	return nextContainerScrollTarget( root, openBlock.clientId );
}

/**
 * Paints the design as it streams, through `host`. Registers itself as the
 * stream handler while mounted.
 */
export function usePageDesignRenderer( host: EditorHost ): void {
	const hostRef = useRef( host );
	hostRef.current = host;

	const stateByToolCall = useRef< Map< string, ToolCallState > >( new Map() );
	const capturedToolCalls = useRef< Set< string > >( new Set() );
	const flushTimer = useRef< ReturnType< typeof setTimeout > | null >( null );
	const retryTimer = useRef< ReturnType< typeof setTimeout > | null >( null );
	const previewStylesInterval = useRef< ReturnType< typeof setInterval > | null >( null );
	const pendingToolCallId = useRef< string | null >( null );

	const stage = useCallback( ( rootClientId: string, blocks: EditorBlock[] ) => {
		hostRef.current.stageBlocks( rootClientId, blocks );
	}, [] );

	const getToolCallState = useCallback( ( toolCallId: string ): ToolCallState => {
		let state = stateByToolCall.current.get( toolCallId );

		if ( ! state ) {
			state = createToolCallState();
			stateByToolCall.current.set( toolCallId, state );
		}

		return state;
	}, [] );

	const placeTopLevelBlocks = useCallback(
		( state: ToolCallState, rootClientId: string, blocks: EditorBlock[] ): void => {
			if ( ! blocks.length ) {
				return;
			}

			// The first block replaces the page in one write, so the canvas never shows it empty.
			state.topLevelBlocks = state.didReplaceInitialContent
				? [ ...state.topLevelBlocks, ...blocks ]
				: blocks;
			state.didReplaceInitialContent = true;
			stage( rootClientId, state.topLevelBlocks );
		},
		[ stage ]
	);

	const syncChildren = useCallback(
		( openBlock: OpenBlock ): void => stage( openBlock.clientId, openBlock.childBlocks ),
		[ stage ]
	);

	const openTopLevelBlock = useCallback(
		( state: ToolCallState, rootClientId: string, markup: string ): OpenBlock | null => {
			// Only once the buffer opens with a block: text ahead of it is a wrapper, not a block.
			const preview = startsWithOpenDelimiter( markup ) ? createPreviewBlock( markup ) : null;

			if ( ! preview ) {
				return null;
			}

			placeTopLevelBlocks( state, rootClientId, [ preview.block ] );

			return createOpenBlock( preview.block.clientId, preview.markup );
		},
		[ placeTopLevelBlocks ]
	);

	const appendChildren = useCallback(
		( openBlock: OpenBlock, blocks: EditorBlock[] ): string | null => {
			if ( ! blocks.length ) {
				return null;
			}

			openBlock.childBlocks = [ ...openBlock.childBlocks, ...blocks ];
			syncChildren( openBlock );

			return lastContainerClientId( blocks );
		},
		[ syncChildren ]
	);

	const openChildBlock = useCallback(
		( parent: OpenBlock, markup: string ): OpenBlock | null => {
			const preview = createPreviewBlock( markup );

			if ( ! preview ) {
				return null;
			}

			parent.childBlocks = [ ...parent.childBlocks, preview.block ];
			syncChildren( parent );

			return createOpenBlock(
				preview.block.clientId,
				preview.markup,
				CONTAINER_BLOCK_NAMES.includes( preview.block.name )
			);
		},
		[ syncChildren ]
	);

	const closeChildBlock = useCallback(
		( parent: OpenBlock, child: OpenBlock, finalMarkup: string ): string | null => {
			const index = parent.childBlocks.findIndex( ( block ) => block.clientId === child.clientId );

			if ( index === -1 ) {
				return null;
			}

			const finalBlocks = repairBlocksFromMarkup( finalMarkup );

			parent.childBlocks = [
				...parent.childBlocks.slice( 0, index ),
				...finalBlocks,
				...parent.childBlocks.slice( index + 1 ),
			];
			syncChildren( parent );

			return lastContainerClientId( finalBlocks );
		},
		[ syncChildren ]
	);

	// Feeds what has arrived of an open block's inner markup to its children,
	// and returns the block the canvas should follow.
	const updateOpenBlock = useCallback(
		function update(
			openBlock: OpenBlock,
			isTopLevel = false,
			root: OpenBlock = openBlock
		): string | null {
			const innerMarkup = getInnerMarkup( openBlock.markup );
			const newInnerMarkup = innerMarkup.startsWith( openBlock.lastInnerMarkup )
				? innerMarkup.slice( openBlock.lastInnerMarkup.length )
				: innerMarkup;

			openBlock.lastInnerMarkup = innerMarkup;
			openBlock.innerBuffer += newInnerMarkup;

			let scrollTarget: string | null = null;

			while ( openBlock.innerBuffer.trim() ) {
				const child = openBlock.openChild;

				if ( child ) {
					child.markup += openBlock.innerBuffer;
					openBlock.innerBuffer = '';

					const completed = extractCompleteTopLevelBlock( child.markup );

					if ( ! completed ) {
						scrollTarget = update( child, false, root );
						break;
					}

					scrollTarget =
						nextContainerScrollTarget(
							root,
							closeChildBlock( openBlock, child, completed.blockMarkup )
						) ?? scrollTarget;
					openBlock.openChild = null;
					openBlock.innerBuffer = completed.remaining;
					continue;
				}

				const completed = extractCompleteTopLevelBlock( openBlock.innerBuffer );

				if ( completed ) {
					const blocks = repairBlocksFromMarkup( completed.blockMarkup );

					scrollTarget =
						nextContainerScrollTarget( root, appendChildren( openBlock, blocks ) ) ?? scrollTarget;
					openBlock.innerBuffer = completed.remaining;
					continue;
				}

				const nextChild = openChildBlock( openBlock, openBlock.innerBuffer );

				if ( nextChild ) {
					openBlock.openChild = nextChild;
					openBlock.innerBuffer = '';
					scrollTarget =
						update( nextChild, false, root ) ?? containerScrollTarget( root, nextChild );
				}

				break;
			}

			if ( ! openBlock.scrolledAfterFirstContent && openBlock.childBlocks.length ) {
				openBlock.scrolledAfterFirstContent = true;

				return isTopLevel ? openBlock.clientId : containerScrollTarget( root, openBlock );
			}

			return scrollTarget;
		},
		[ appendChildren, closeChildBlock, openChildBlock ]
	);

	const closeTopLevelBlock = useCallback(
		(
			state: ToolCallState,
			rootClientId: string,
			openBlock: OpenBlock,
			finalMarkup: string
		): void => {
			const finalBlocks = repairBlocksFromMarkup( finalMarkup );
			const index = state.topLevelBlocks.findIndex(
				( block ) => block.clientId === openBlock.clientId
			);

			if ( index === -1 && ! finalBlocks.length ) {
				return;
			}

			state.topLevelBlocks =
				index === -1
					? [ ...state.topLevelBlocks, ...finalBlocks ]
					: [
							...state.topLevelBlocks.slice( 0, index ),
							...finalBlocks,
							...state.topLevelBlocks.slice( index + 1 ),
					  ];
			stage( rootClientId, state.topLevelBlocks );
		},
		[ stage ]
	);

	// Places what the page buffer holds, and returns the block the canvas should follow.
	const processPageBuffer = useCallback(
		( state: ToolCallState, rootClientId: string ): string | null => {
			let scrollTarget: string | null = null;

			while ( state.pageBuffer.trim() ) {
				const openBlock = state.openBlock;

				if ( openBlock ) {
					openBlock.markup += state.pageBuffer;
					state.pageBuffer = '';

					const completed = extractCompleteTopLevelBlock( openBlock.markup );

					if ( ! completed ) {
						scrollTarget = updateOpenBlock( openBlock, true ) ?? scrollTarget;
						break;
					}

					closeTopLevelBlock( state, rootClientId, openBlock, completed.blockMarkup );
					state.openBlock = null;
					state.pageBuffer = completed.remaining;
					continue;
				}

				const completed = extractCompleteTopLevelBlock( state.pageBuffer );

				if ( completed ) {
					const blocks = repairBlocksFromMarkup( completed.blockMarkup );

					placeTopLevelBlocks( state, rootClientId, blocks );
					scrollTarget = blocks[ blocks.length - 1 ]?.clientId ?? scrollTarget;
					state.pageBuffer = completed.remaining;
					continue;
				}

				const nextOpenBlock = openTopLevelBlock( state, rootClientId, state.pageBuffer );

				if ( nextOpenBlock ) {
					state.openBlock = nextOpenBlock;
					state.pageBuffer = '';
					scrollTarget = updateOpenBlock( nextOpenBlock, true ) ?? nextOpenBlock.clientId;
				}

				break;
			}

			return scrollTarget;
		},
		[ closeTopLevelBlock, openTopLevelBlock, placeTopLevelBlocks, updateOpenBlock ]
	);

	// Paints what has streamed so far; false while the canvas has no root.
	const flush = useCallback(
		( toolCallId: string, isFinal: boolean ): boolean => {
			const markup = getStreamedMarkup( toolCallId );

			// Forgotten by the transport since it was queued: a new session began.
			if ( markup === undefined ) {
				return true;
			}

			const rootClientId = hostRef.current.resolveRoot();

			if ( ! rootClientId ) {
				return false;
			}

			// The canvas is mounted and nothing has been staged yet: the last
			// moment the page can be snapshotted as it was. Nothing is staged
			// without it; a capture that fails is tried again on the next flush.
			if ( ! capturedToolCalls.current.has( toolCallId ) ) {
				try {
					hostRef.current.captureCheckpoint( toolCallId, rootClientId );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( '[AgentsManager] The page could not be checkpointed:', error );
					return false;
				}

				capturedToolCalls.current.add( toolCallId );
			}

			const pageContent = getPageSectionMarkup( markup );

			if ( pageContent !== null ) {
				const state = getToolCallState( toolCallId );
				const newContent = pageContent.startsWith( state.lastPageContent )
					? pageContent.slice( state.lastPageContent.length )
					: pageContent;

				state.lastPageContent = pageContent;

				if ( newContent ) {
					state.pageBuffer += newContent;

					const scrollTarget = processPageBuffer( state, rootClientId );

					if ( scrollTarget ) {
						scrollToBlockBottom( scrollTarget );
					}
				}
			}

			if ( isFinal ) {
				hostRef.current.commitFinalDesign( toolCallId, rootClientId );
			}

			return true;
		},
		[ getToolCallState, processPageBuffer ]
	);

	const clearRetry = useCallback( () => {
		if ( retryTimer.current ) {
			clearTimeout( retryTimer.current );
			retryTimer.current = null;
		}
	}, [] );

	// Markup that arrives before the canvas has mounted would otherwise flush
	// once into nothing, with no later delta to try again. A flush that lands
	// supersedes any retry still queued.
	const flushOrRetry = useCallback(
		function attempt(
			toolCallId: string,
			isFinal: boolean,
			attemptsLeft = MAX_FLUSH_RETRIES
		): void {
			clearRetry();

			if ( flush( toolCallId, isFinal ) || attemptsLeft === 0 ) {
				return;
			}

			retryTimer.current = setTimeout( () => {
				retryTimer.current = null;
				attempt( toolCallId, isFinal, attemptsLeft - 1 );
			}, FLUSH_INTERVAL_MS );
		},
		[ clearRetry, flush ]
	);

	const stopPreviewStyles = useCallback( () => {
		if ( previewStylesInterval.current ) {
			clearInterval( previewStylesInterval.current );
			previewStylesInterval.current = null;
		}
	}, [] );

	const handleUpdate = useCallback(
		( update: StreamUpdate ): void => {
			pendingToolCallId.current = update.toolCallId;

			if ( update.isFinal ) {
				stopPreviewStyles();

				if ( flushTimer.current ) {
					clearTimeout( flushTimer.current );
					flushTimer.current = null;
				}

				flushOrRetry( update.toolCallId, true );
				return;
			}

			// Kept injected while a design streams: the canvas iframe can mount mid-stream.
			if ( ! previewStylesInterval.current ) {
				ensurePreviewStyles();
				previewStylesInterval.current = setInterval( ensurePreviewStyles, 1000 );
			}

			if ( ! flushTimer.current ) {
				flushTimer.current = setTimeout( () => {
					flushTimer.current = null;

					if ( pendingToolCallId.current ) {
						flushOrRetry( pendingToolCallId.current, false );
					}
				}, FLUSH_INTERVAL_MS );
			}
		},
		[ flushOrRetry, stopPreviewStyles ]
	);

	useEffect( () => {
		setStreamHandler( handleUpdate );

		return () => {
			setStreamHandler( undefined );
			stopPreviewStyles();
			clearRetry();

			if ( flushTimer.current ) {
				clearTimeout( flushTimer.current );
				flushTimer.current = null;
			}
		};
	}, [ clearRetry, handleUpdate, stopPreviewStyles ] );
}
