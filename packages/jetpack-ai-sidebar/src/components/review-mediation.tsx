/**
 * ReviewMediation — renders the AI Editorial Review card. Mounted by
 * `getChatComponent('review-mediation')` from a show-component response.
 */

/**
 * External dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import {
	applyReviewEdit,
	findBlockElement,
	findBlockListLayout,
	isSupportedEditBlockType,
	undoBlockEdit,
} from '../utils/block-actions';
import {
	trackAiEditorialReviewItemAction,
	trackAiEditorialReviewResultRendered,
	type ReviewContext,
} from '../utils/tracking';
import BlockRef, { type BlockSnapshot } from './block-ref';
import ReviewerChip, { type ReviewerMetadata } from './reviewer-chip';

const FOCUS_MODE_CLASS = 'is-focus-mode';

/**
 * Types mirroring the wpcom `Review_Mediator_Ability` structured output.
 */
interface ReviewerPosition {
	reviewer: string;
	position: string;
}

interface CandidateResolution {
	source: 'reviewer' | 'ai';
	reviewer_name: string | null;
	label: string;
	block_index: number | null;
	current_text?: string;
	text: string;
	rationale: string;
}

interface Conflict {
	subject: string;
	positions: ReviewerPosition[];
	guideline_anchor: string | null;
	recommended_resolution: string;
	candidate_resolutions?: CandidateResolution[];
}

interface Implication {
	change: string;
	implies: string;
	affected_blocks: number[];
}

interface SuggestedEdit {
	block_index: number | null;
	current_text: string;
	suggested_text: string;
	rationale: string;
	supported_by_reviewers: string[];
	requires_manual?: boolean;
}

interface GuidelineViolation {
	category: 'site' | 'copy' | 'images' | 'additional' | 'block';
	block_name: string | null;
	guideline_quote: string | null;
	block_index: number | null;
	violating_text: string;
	issue: string;
}

interface ReviewMediationProps {
	summary: string;
	conflicts: Conflict[];
	implications: Implication[];
	suggested_edits: SuggestedEdit[];
	guideline_violations: GuidelineViolation[];
	review_context?: ReviewContext;
	/** Source post the review was generated for. Used to detect navigation to a different post. */
	postId?: number;
	/**
	 * Server-built map keyed by reviewer display name. Optional — older
	 * mediations or the empty-state payload may omit it; consumers degrade
	 * gracefully (fall back to the deterministic-colour pill).
	 */
	reviewers_metadata?: Record< string, ReviewerMetadata >;
	/**
	 * Unix timestamp when the cached review was first generated. Only set
	 * when the server short-circuited the LLM call on a state-hash match
	 * (same inputs as the previous run). Absent on fresh runs. The client
	 * renders a subtle "reusing cached run" note so the reviewer knows the
	 * result is deterministic rather than a new analysis.
	 */
	cached_at?: number;
}

type EditStatus = 'pending' | 'applying' | 'accepted' | 'dismissed' | 'failed';
type WpCurrentPostStore = { getCurrentPostId?: () => number | null };
type WpGlobal = Window & {
	wp?: {
		data?: {
			select?: ( store: string ) => WpCurrentPostStore | undefined;
		};
	};
};

function getCurrentEditorPostIdFromStore(): number | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	const wp = ( window as WpGlobal ).wp;
	return wp?.data?.select?.( 'core/editor' )?.getCurrentPostId?.() ?? undefined;
}

/**
 * The five PanelBody sections we manage in controlled mode. Used as the
 * key shape for both `openSections` state and `sectionRefs` so the stats-
 * strip click handlers stay type-safe end-to-end.
 */
type SectionKey = 'summary' | 'conflicts' | 'implications' | 'edits' | 'violations';

/**
 * Coarse relative-time formatter for the cached-run hint. Returns "just now",
 * "N minutes ago", "N hours ago", or "N days ago".
 * @param timestamp Unix seconds.
 * @returns Human string.
 */
function formatRelativeTime( timestamp: number ): string {
	const deltaSeconds = Math.max( 0, Math.floor( Date.now() / 1000 - timestamp ) );
	if ( deltaSeconds < 45 ) {
		return __( 'just now', 'jetpack' );
	}
	const minutes = Math.round( deltaSeconds / 60 );
	if ( minutes < 60 ) {
		return sprintf(
			/* translators: %d is a minute count */
			_n( '%d minute ago', '%d minutes ago', minutes, 'jetpack' ),
			minutes
		);
	}
	const hours = Math.round( minutes / 60 );
	if ( hours < 24 ) {
		return sprintf(
			/* translators: %d is an hour count */
			_n( '%d hour ago', '%d hours ago', hours, 'jetpack' ),
			hours
		);
	}
	const days = Math.round( hours / 24 );
	return sprintf(
		/* translators: %d is a day count */
		_n( '%d day ago', '%d days ago', days, 'jetpack' ),
		days
	);
}

/**
 * Truncate a snippet of free text to a sane preview length. Collapses repeated
 * whitespace and appends an ellipsis when over the limit.
 * @param text  Raw text.
 * @param limit Character budget.
 * @returns The truncated string.
 */
function truncateText( text: string, limit = 60 ): string {
	if ( ! text ) {
		return '';
	}
	const stripped = text.replace( /\s+/g, ' ' ).trim();
	if ( stripped.length <= limit ) {
		return stripped;
	}
	return stripped.slice( 0, limit ).trimEnd() + '…';
}

function getGuidelineCategoryLabel( category: GuidelineViolation[ 'category' ] ): string {
	switch ( category ) {
		case 'site':
			return __( 'Site', 'jetpack' );
		case 'copy':
			return __( 'Copy', 'jetpack' );
		case 'images':
			return __( 'Images', 'jetpack' );
		case 'additional':
			return __( 'Additional', 'jetpack' );
		case 'block':
			return __( 'Block', 'jetpack' );
		default:
			return String( category );
	}
}

/**
 * Lookup rather than a nested ternary. Keeps the JSX flat and makes eslint
 * `no-nested-ternary` happy while still i18n-ing each phrase.
 * @param status Current conflict row status.
 * @returns Label for the "Accept AI resolution" button.
 */
function getAiButtonLabel( status: EditStatus ): string {
	switch ( status ) {
		case 'applying':
			return __( 'Applying…', 'jetpack' );
		case 'accepted':
			return __( 'Accepted', 'jetpack' );
		case 'failed':
			return __( 'Retry AI resolution', 'jetpack' );
		default:
			return __( 'Accept AI resolution', 'jetpack' );
	}
}

function flattenBlocks( blocks: BlockSnapshot[] ): BlockSnapshot[] {
	const out: BlockSnapshot[] = [];
	const walk = ( items: BlockSnapshot[] ) => {
		items.forEach( ( block ) => {
			if ( ! block.name ) {
				return;
			}
			out.push( block );
			if ( Array.isArray( block.innerBlocks ) && block.innerBlocks.length > 0 ) {
				walk( block.innerBlocks );
			}
		} );
	};
	walk( blocks );
	return out;
}

function getBlockEditableContent( block: BlockSnapshot | null ): string {
	const raw = block?.attributes?.content;
	if ( typeof raw === 'string' ) {
		return raw;
	}
	if ( raw && typeof raw.toHTMLString === 'function' ) {
		return raw.toHTMLString();
	}
	return '';
}

function countOccurrences( source: string, needle: string ): number {
	if ( needle === '' ) {
		return 0;
	}
	let count = 0;
	let pos = 0;
	while ( true ) {
		const found = source.indexOf( needle, pos );
		if ( found === -1 ) {
			return count;
		}
		count++;
		pos = found + 1;
	}
}

function getTextTargetDisabledReason(
	block: BlockSnapshot | null,
	currentText?: string
): string | undefined {
	if ( typeof currentText !== 'string' || currentText === '' ) {
		return __( 'Needs manual edit — no exact source text', 'jetpack' );
	}
	const occurrences = countOccurrences( getBlockEditableContent( block ), currentText );
	if ( occurrences === 0 ) {
		return __( 'Needs manual edit — source text changed', 'jetpack' );
	}
	if ( occurrences > 1 ) {
		return __( 'Needs manual edit — source text appears more than once', 'jetpack' );
	}
	return undefined;
}

function hasRenderableGuidelineQuote( quote: string | null ): boolean {
	return typeof quote === 'string' && quote.trim() !== '';
}

function isManualSuggestedEdit( edit: SuggestedEdit ): boolean {
	return edit.requires_manual === true;
}

function deriveResultOutcome(
	isCacheHit: boolean,
	reviewContext: ReviewContext | undefined,
	hasNoFindings: boolean
): 'success' | 'cache_hit' | 'no_findings' | 'insufficient_input' {
	if ( isCacheHit ) {
		return 'cache_hit';
	}
	if ( reviewContext === 'insufficient_input' ) {
		return 'insufficient_input';
	}
	if ( hasNoFindings ) {
		return 'no_findings';
	}
	return 'success';
}

function getSuggestedEditApplyUnavailableReason(
	isManual: boolean,
	disabledReason?: string
): string | undefined {
	if ( isManual ) {
		return __( 'Needs manual edit.', 'jetpack' );
	}
	if ( disabledReason ) {
		return disabledReason;
	}
	return undefined;
}

function getConflictApplyUnavailableReason(
	reasons: Array< string | undefined >
): string | undefined {
	const uniqueReasons = [ ...new Set( reasons.filter( Boolean ) as string[] ) ];
	if ( uniqueReasons.length === 0 ) {
		return undefined;
	}
	if ( uniqueReasons.length === 1 ) {
		return uniqueReasons[ 0 ];
	}
	return __( 'Some resolutions need manual edit.', 'jetpack' );
}

/**
 * Main component.
 * @param {ReviewMediationProps} props - Structured mediation output.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function ReviewMediation( {
	summary,
	conflicts,
	implications,
	suggested_edits,
	guideline_violations,
	review_context,
	postId,
	reviewers_metadata,
	cached_at,
}: ReviewMediationProps ) {
	// Review actions are only safe when the result can be tied to the current editor post.
	const currentPostId = useSelect(
		( select ) =>
			(
				select( 'core/editor' ) as { getCurrentPostId?: () => number | null }
			 )?.getCurrentPostId?.() ?? undefined,
		[]
	);
	const isPostStale = ! postId || ! currentPostId || postId !== currentPostId;
	const isLatestPostContextStale = useCallback( () => {
		// Async edit guards must read the editor store at call time so navigation
		// between the click and delayed block write is observed immediately.
		const latestCurrentPostId = getCurrentEditorPostIdFromStore() ?? currentPostId;
		return ! postId || ! latestCurrentPostId || postId !== latestCurrentPostId;
	}, [ currentPostId, postId ] );

	const [ editStatuses, setEditStatuses ] = useState< Record< number, EditStatus > >( {} );
	const [ conflictStatuses, setConflictStatuses ] = useState< Record< number, EditStatus > >( {} );
	const [ bulkRunning, setBulkRunning ] = useState( false );

	type UndoSnapshot = { clientId: string; contentBefore: string; contentAfter: string };
	const editSnapshots = useRef< Record< number, UndoSnapshot > >( {} );
	const conflictSnapshots = useRef< Record< number, UndoSnapshot > >( {} );

	// Controlled open-state per PanelBody so the stats-strip click handler
	// can programmatically expand a section before scrolling to it.
	const [ openSections, setOpenSections ] = useState< Record< SectionKey, boolean > >( {
		summary: true,
		conflicts: true,
		implications: true,
		edits: true,
		violations: true,
	} );

	// Per-section wrapper refs used by `handleStatClick` to scroll the
	// target panel into view. Map keys match `SectionKey` exactly.
	const sectionRefs = useRef< Record< SectionKey, HTMLDivElement | null > >( {
		summary: null,
		conflicts: null,
		implications: null,
		edits: null,
		violations: null,
	} );

	const setSectionOpen = useCallback( ( key: SectionKey, opened: boolean ) => {
		setOpenSections( ( prev ) => ( { ...prev, [ key ]: opened } ) );
	}, [] );

	const renderedGuidelineViolations = useMemo(
		() => guideline_violations.filter( ( v ) => hasRenderableGuidelineQuote( v.guideline_quote ) ),
		[ guideline_violations ]
	);

	const handleStatClick = useCallback(
		( key: SectionKey ) => {
			if ( isPostStale ) {
				return;
			}
			// Open first, then scroll on the next-next frame so React + layout
			// have committed the expanded panel before scrollIntoView runs.
			setSectionOpen( key, true );
			requestAnimationFrame( () => {
				requestAnimationFrame( () => {
					sectionRefs.current[ key ]?.scrollIntoView( {
						behavior: 'smooth',
						block: 'start',
					} );
				} );
			} );
		},
		[ isPostStale, setSectionOpen ]
	);

	// Flat pre-order list of blocks; ability's `block_index` maps to this array.
	// Matches wpcom's recursive Review_Mediator_Ability::extract_blocks() order.
	const blocks = useSelect( ( select ) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const rootBlocks = ( ( select as any )( 'core/block-editor' ).getBlocks?.() ??
			[] ) as BlockSnapshot[];
		return flattenBlocks( rootBlocks );
	}, [] );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { selectBlock } = useDispatch( 'core/block-editor' ) as any;

	const getBlock = useCallback(
		( blockIndex: number | null ): BlockSnapshot | null => {
			if ( blockIndex === null || blockIndex < 0 || blockIndex >= blocks.length ) {
				return null;
			}
			return blocks[ blockIndex ] ?? null;
		},
		[ blocks ]
	);
	const getClientId = useCallback(
		( blockIndex: number | null ): string | null => getBlock( blockIndex )?.clientId ?? null,
		[ getBlock ]
	);
	const getBlockEditDisabledReason = useCallback(
		( blockIndex: number | null, currentText?: string ): string | undefined => {
			if ( blockIndex === null ) {
				return __( 'Needs manual edit — no single block target', 'jetpack' );
			}
			const block = getBlock( blockIndex );
			if ( ! block ) {
				return __( 'Needs manual edit — block no longer present', 'jetpack' );
			}
			if ( ! isSupportedEditBlockType( block.name ) ) {
				return __( 'Needs manual edit — unsupported block type', 'jetpack' );
			}
			return getTextTargetDisabledReason( block, currentText );
		},
		[ getBlock ]
	);

	const focusBlock = useCallback(
		( blockIndex: number | null ) => {
			if ( isPostStale ) {
				return;
			}
			const clientId = getClientId( blockIndex );
			if ( ! clientId ) {
				return;
			}
			selectBlock?.( clientId );
			const el = findBlockElement( clientId );
			el?.scrollIntoView?.( { behavior: 'smooth', block: 'center' } );
			// Mirror block-notes' dim-others UX — class-level toggle (see
			// index.ts commentary for why we don't use the private spotlight action).
			findBlockListLayout()?.classList.add( FOCUS_MODE_CLASS );
		},
		[ getClientId, isPostStale, selectBlock ]
	);
	const focusCurrentPostBlock = isPostStale ? undefined : focusBlock;

	const fireItemAction = useCallback(
		( options: {
			action: 'accept' | 'undo' | 'dismiss' | 'bulk_accept';
			target: 'edit' | 'conflict' | 'mixed';
			outcome: 'success' | 'failed' | 'partial_failed';
			itemCount?: number;
		} ) => {
			trackAiEditorialReviewItemAction( options );
		},
		[]
	);

	// Clear focus-mode when the mediation session ends.
	useEffect( () => {
		return () => {
			findBlockListLayout()?.classList.remove( FOCUS_MODE_CLASS );
		};
	}, [] );

	const setEditStatus = useCallback( ( index: number, status: EditStatus ) => {
		setEditStatuses( ( prev ) => ( { ...prev, [ index ]: status } ) );
	}, [] );
	const setConflictStatus = useCallback( ( index: number, status: EditStatus ) => {
		setConflictStatuses( ( prev ) => ( { ...prev, [ index ]: status } ) );
	}, [] );

	const applyTextToBlock = useCallback(
		async (
			blockIndex: number | null,
			text: string,
			currentText?: string
		): Promise< {
			success: boolean;
			clientId?: string;
			contentBefore?: string;
			contentAfter?: string;
		} > => {
			if ( isPostStale || isLatestPostContextStale() ) {
				return { success: false };
			}
			if ( getBlockEditDisabledReason( blockIndex, currentText ) ) {
				return { success: false };
			}
			const clientId = getClientId( blockIndex );
			if ( ! clientId ) {
				return { success: false };
			}
			try {
				const result = await applyReviewEdit( clientId, text, undefined, currentText, () => {
					return ! isLatestPostContextStale();
				} );
				if ( isLatestPostContextStale() ) {
					return { success: false };
				}
				if ( result?.success ) {
					return {
						success: true,
						clientId: result.clientId ?? clientId,
						contentBefore: result.contentBefore,
						contentAfter: result.contentAfter,
					};
				}
				if ( result?.error ) {
					// eslint-disable-next-line no-console
					console.warn( '[ReviewMediation] applyReviewEdit failed', result.error );
				}
				return { success: false };
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] applyReviewEdit threw', err );
				return { success: false };
			}
		},
		[ getBlockEditDisabledReason, getClientId, isLatestPostContextStale, isPostStale ]
	);

	// ---------- Suggested edit handlers ----------
	const handleAcceptEdit = useCallback(
		async ( edit: SuggestedEdit, editIndex: number ) => {
			if ( isPostStale ) {
				return;
			}
			if ( isManualSuggestedEdit( edit ) ) {
				return;
			}
			if ( edit.block_index === null ) {
				setEditStatus( editIndex, 'failed' );
				fireItemAction( {
					action: 'accept',
					target: 'edit',
					outcome: 'failed',
				} );
				return;
			}
			setEditStatus( editIndex, 'applying' );
			const result = await applyTextToBlock(
				edit.block_index,
				edit.suggested_text,
				edit.current_text
			);
			if (
				result.success &&
				result.clientId &&
				typeof result.contentBefore === 'string' &&
				typeof result.contentAfter === 'string'
			) {
				editSnapshots.current[ editIndex ] = {
					clientId: result.clientId,
					contentBefore: result.contentBefore,
					contentAfter: result.contentAfter,
				};
			}
			fireItemAction( {
				action: 'accept',
				target: 'edit',
				outcome: result.success ? 'success' : 'failed',
			} );
			setEditStatus( editIndex, result.success ? 'accepted' : 'failed' );
		},
		[ applyTextToBlock, fireItemAction, isPostStale, setEditStatus ]
	);
	const handleUndoEdit = useCallback(
		( editIndex: number ) => {
			if ( isPostStale ) {
				return;
			}
			const snap = editSnapshots.current[ editIndex ];
			if ( snap ) {
				if ( ! undoBlockEdit( snap.clientId, snap.contentBefore, snap.contentAfter ) ) {
					fireItemAction( {
						action: 'undo',
						target: 'edit',
						outcome: 'failed',
					} );
					return;
				}
				delete editSnapshots.current[ editIndex ];
			}
			fireItemAction( {
				action: 'undo',
				target: 'edit',
				outcome: 'success',
			} );
			setEditStatus( editIndex, 'pending' );
		},
		[ fireItemAction, isPostStale, setEditStatus ]
	);
	const handleDismissEdit = useCallback(
		( editIndex: number ) => {
			if ( isPostStale ) {
				return;
			}
			fireItemAction( {
				action: 'dismiss',
				target: 'edit',
				outcome: 'success',
			} );
			setEditStatus( editIndex, 'dismissed' );
		},
		[ fireItemAction, isPostStale, setEditStatus ]
	);

	// ---------- Conflict handlers ----------
	const handleAcceptCandidate = useCallback(
		async ( conflictIndex: number, candidate: CandidateResolution ) => {
			if ( isPostStale ) {
				return;
			}
			if ( getBlockEditDisabledReason( candidate.block_index, candidate.current_text ) ) {
				setConflictStatus( conflictIndex, 'failed' );
				fireItemAction( {
					action: 'accept',
					target: 'conflict',
					outcome: 'failed',
				} );
				return;
			}
			setConflictStatus( conflictIndex, 'applying' );
			const result = await applyTextToBlock(
				candidate.block_index,
				candidate.text,
				candidate.current_text
			);
			if (
				result.success &&
				result.clientId &&
				typeof result.contentBefore === 'string' &&
				typeof result.contentAfter === 'string'
			) {
				conflictSnapshots.current[ conflictIndex ] = {
					clientId: result.clientId,
					contentBefore: result.contentBefore,
					contentAfter: result.contentAfter,
				};
			}
			fireItemAction( {
				action: 'accept',
				target: 'conflict',
				outcome: result.success ? 'success' : 'failed',
			} );
			setConflictStatus( conflictIndex, result.success ? 'accepted' : 'failed' );
		},
		[ applyTextToBlock, fireItemAction, getBlockEditDisabledReason, isPostStale, setConflictStatus ]
	);
	const handleUndoConflict = useCallback(
		( conflictIndex: number ) => {
			if ( isPostStale ) {
				return;
			}
			const snap = conflictSnapshots.current[ conflictIndex ];
			if ( snap ) {
				if ( ! undoBlockEdit( snap.clientId, snap.contentBefore, snap.contentAfter ) ) {
					fireItemAction( {
						action: 'undo',
						target: 'conflict',
						outcome: 'failed',
					} );
					return;
				}
				delete conflictSnapshots.current[ conflictIndex ];
			}
			fireItemAction( {
				action: 'undo',
				target: 'conflict',
				outcome: 'success',
			} );
			setConflictStatus( conflictIndex, 'pending' );
		},
		[ fireItemAction, isPostStale, setConflictStatus ]
	);
	const handleDismissConflict = useCallback(
		( conflictIndex: number ) => {
			if ( isPostStale ) {
				return;
			}
			fireItemAction( {
				action: 'dismiss',
				target: 'conflict',
				outcome: 'success',
			} );
			setConflictStatus( conflictIndex, 'dismissed' );
		},
		[ fireItemAction, isPostStale, setConflictStatus ]
	);

	// ---------- Bulk apply ----------
	const pendingAiConflictCount = useMemo( () => {
		return conflicts.reduce( ( acc, conflict, i ) => {
			const status = conflictStatuses[ i ] ?? 'pending';
			if ( status !== 'pending' && status !== 'failed' ) {
				return acc;
			}
			const aiCandidate = conflict.candidate_resolutions?.find(
				( c ) => c.source === 'ai' && ! getBlockEditDisabledReason( c.block_index, c.current_text )
			);
			return aiCandidate ? acc + 1 : acc;
		}, 0 );
	}, [ conflicts, conflictStatuses, getBlockEditDisabledReason ] );

	const pendingEditCount = useMemo( () => {
		return suggested_edits.reduce( ( acc, edit, i ) => {
			const status = editStatuses[ i ] ?? 'pending';
			if ( status !== 'pending' && status !== 'failed' ) {
				return acc;
			}
			if ( isManualSuggestedEdit( edit ) ) {
				return acc;
			}
			return getBlockEditDisabledReason( edit.block_index, edit.current_text ) ? acc : acc + 1;
		}, 0 );
	}, [ suggested_edits, editStatuses, getBlockEditDisabledReason ] );

	const totalPendingCount = pendingAiConflictCount + pendingEditCount;

	const handleAcceptAllAi = useCallback( async () => {
		if ( isPostStale || bulkRunning || totalPendingCount === 0 ) {
			return;
		}
		let bulkTarget: 'edit' | 'conflict' | 'mixed' = 'edit';
		if ( pendingAiConflictCount > 0 && pendingEditCount > 0 ) {
			bulkTarget = 'mixed';
		} else if ( pendingAiConflictCount > 0 ) {
			bulkTarget = 'conflict';
		}
		let successCount = 0;
		let failureCount = 0;
		const getBulkOutcome = () => {
			if ( failureCount === 0 ) {
				return 'success';
			}
			return successCount === 0 ? 'failed' : 'partial_failed';
		};
		setBulkRunning( true );
		try {
			// Sequential so users see the shimmer on each block as it applies;
			// parallel would race the same dispatch and confuse the state store.
			for ( let i = 0; i < conflicts.length; i++ ) {
				if ( isLatestPostContextStale() ) {
					return;
				}
				const status = conflictStatuses[ i ] ?? 'pending';
				if ( status !== 'pending' && status !== 'failed' ) {
					continue;
				}
				const aiCandidate = conflicts[ i ].candidate_resolutions?.find(
					( c ) =>
						c.source === 'ai' && ! getBlockEditDisabledReason( c.block_index, c.current_text )
				);
				if ( ! aiCandidate ) {
					continue;
				}
				setConflictStatus( i, 'applying' );
				// eslint-disable-next-line no-await-in-loop
				const result = await applyTextToBlock(
					aiCandidate.block_index,
					aiCandidate.text,
					aiCandidate.current_text
				);
				if ( isLatestPostContextStale() ) {
					setConflictStatus( i, status );
					return;
				}
				if (
					result.success &&
					result.clientId &&
					typeof result.contentBefore === 'string' &&
					typeof result.contentAfter === 'string'
				) {
					conflictSnapshots.current[ i ] = {
						clientId: result.clientId,
						contentBefore: result.contentBefore,
						contentAfter: result.contentAfter,
					};
				}
				if ( ! result.success ) {
					failureCount++;
				} else {
					successCount++;
				}
				setConflictStatus( i, result.success ? 'accepted' : 'failed' );
			}
			for ( let i = 0; i < suggested_edits.length; i++ ) {
				if ( isLatestPostContextStale() ) {
					return;
				}
				const status = editStatuses[ i ] ?? 'pending';
				if ( status !== 'pending' && status !== 'failed' ) {
					continue;
				}
				const edit = suggested_edits[ i ];
				if ( isManualSuggestedEdit( edit ) ) {
					continue;
				}
				if ( getBlockEditDisabledReason( edit.block_index, edit.current_text ) ) {
					continue;
				}
				setEditStatus( i, 'applying' );
				// eslint-disable-next-line no-await-in-loop
				const result = await applyTextToBlock(
					edit.block_index,
					edit.suggested_text,
					edit.current_text
				);
				if ( isLatestPostContextStale() ) {
					setEditStatus( i, status );
					return;
				}
				if (
					result.success &&
					result.clientId &&
					typeof result.contentBefore === 'string' &&
					typeof result.contentAfter === 'string'
				) {
					editSnapshots.current[ i ] = {
						clientId: result.clientId,
						contentBefore: result.contentBefore,
						contentAfter: result.contentAfter,
					};
				}
				if ( ! result.success ) {
					failureCount++;
				} else {
					successCount++;
				}
				setEditStatus( i, result.success ? 'accepted' : 'failed' );
			}
			if ( isLatestPostContextStale() ) {
				return;
			}
			fireItemAction( {
				action: 'bulk_accept',
				target: bulkTarget,
				outcome: getBulkOutcome(),
				itemCount: successCount + failureCount,
			} );
		} finally {
			setBulkRunning( false );
		}
	}, [
		bulkRunning,
		totalPendingCount,
		pendingAiConflictCount,
		pendingEditCount,
		conflicts,
		conflictStatuses,
		suggested_edits,
		editStatuses,
		applyTextToBlock,
		fireItemAction,
		getBlockEditDisabledReason,
		isLatestPostContextStale,
		isPostStale,
		setConflictStatus,
		setEditStatus,
	] );

	// ---------- Stats ----------
	const acceptedCount = useMemo(
		() =>
			Object.values( editStatuses ).filter( ( s ) => s === 'accepted' ).length +
			Object.values( conflictStatuses ).filter( ( s ) => s === 'accepted' ).length,
		[ editStatuses, conflictStatuses ]
	);
	const dismissedCount = useMemo(
		() =>
			Object.values( editStatuses ).filter( ( s ) => s === 'dismissed' ).length +
			Object.values( conflictStatuses ).filter( ( s ) => s === 'dismissed' ).length,
		[ editStatuses, conflictStatuses ]
	);

	const hasNoReviewerInput =
		conflicts.length === 0 &&
		implications.length === 0 &&
		suggested_edits.length === 0 &&
		renderedGuidelineViolations.length === 0;

	// Lookup helper — `reviewers_metadata` may be absent on older payloads.
	const getReviewerMetadata = useCallback(
		( name: string ): ReviewerMetadata | null => reviewers_metadata?.[ name ] ?? null,
		[ reviewers_metadata ]
	);

	// Latch on the first effect run so re-renders do not duplicate `_result_rendered`.
	const hasTrackedResultRef = useRef( false );
	useEffect( () => {
		if ( isPostStale || hasTrackedResultRef.current ) {
			return;
		}
		hasTrackedResultRef.current = true;
		const isCacheHit = cached_at !== undefined;
		const noReviewerSignal =
			conflicts.length === 0 &&
			implications.length === 0 &&
			suggested_edits.length === 0 &&
			renderedGuidelineViolations.length === 0;
		trackAiEditorialReviewResultRendered( {
			outcome: deriveResultOutcome( isCacheHit, review_context, noReviewerSignal ),
			conflictCount: conflicts.length,
			implicationCount: implications.length,
			suggestedEditCount: suggested_edits.length,
			guidelineViolationCount: renderedGuidelineViolations.length,
			reviewContext: review_context,
		} );
	}, [
		cached_at,
		conflicts,
		implications,
		isPostStale,
		renderedGuidelineViolations,
		review_context,
		suggested_edits,
	] );

	return (
		<div
			className={ `jetpack-ai-review-mediation${ isPostStale ? ' is-post-stale' : '' }` }
			aria-disabled={ isPostStale || undefined }
		>
			{ isPostStale && (
				<p className="jetpack-ai-review-mediation__stale-warning" role="note">
					{ __( 'Review context changed. Start a new chat and re-run this review.', 'jetpack' ) }
				</p>
			) }
			{ /* ---------- Stats strip ---------- *
			 * Each chip that maps to a section (`conflicts`, `implications`,
			 * `edits`, `violations`) becomes a button that scrolls — and
			 * expands if collapsed — the matching PanelBody. `accepted` and
			 * `dismissed` are summary counts that don't map to one section,
			 * so they stay informational `<li>`s.
			 */ }
			<ul
				className="jetpack-ai-review-mediation__stats"
				aria-label={ __( 'Review stats', 'jetpack' ) }
			>
				{ conflicts.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-review-mediation__stat is-conflicts is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'conflicts' ) }
							title={ __( 'Jump to conflicts', 'jetpack' ) }
						>
							<span className="jetpack-ai-review-mediation__stat-count">{ conflicts.length }</span>{ ' ' }
							{ _n( 'conflict', 'conflicts', conflicts.length, 'jetpack' ) }
						</button>
					</li>
				) }
				{ implications.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-review-mediation__stat is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'implications' ) }
							title={ __( 'Jump to implications', 'jetpack' ) }
						>
							<span className="jetpack-ai-review-mediation__stat-count">
								{ implications.length }
							</span>{ ' ' }
							{ _n( 'implication', 'implications', implications.length, 'jetpack' ) }
						</button>
					</li>
				) }
				{ suggested_edits.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-review-mediation__stat is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'edits' ) }
							title={ __( 'Jump to suggested edits', 'jetpack' ) }
						>
							<span className="jetpack-ai-review-mediation__stat-count">
								{ suggested_edits.length }
							</span>{ ' ' }
							{ _n( 'edit', 'edits', suggested_edits.length, 'jetpack' ) }
						</button>
					</li>
				) }
				{ renderedGuidelineViolations.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-review-mediation__stat is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'violations' ) }
							title={ __( 'Jump to guideline violations', 'jetpack' ) }
						>
							<span className="jetpack-ai-review-mediation__stat-count">
								{ renderedGuidelineViolations.length }
							</span>{ ' ' }
							{ _n( 'violation', 'violations', renderedGuidelineViolations.length, 'jetpack' ) }
						</button>
					</li>
				) }
				{ acceptedCount > 0 && (
					<li className="jetpack-ai-review-mediation__stat is-accepted">
						<span className="jetpack-ai-review-mediation__stat-count">{ acceptedCount }</span>{ ' ' }
						{ __( 'accepted', 'jetpack' ) }
					</li>
				) }
				{ dismissedCount > 0 && (
					<li className="jetpack-ai-review-mediation__stat is-dismissed">
						<span className="jetpack-ai-review-mediation__stat-count">{ dismissedCount }</span>{ ' ' }
						{ __( 'dismissed', 'jetpack' ) }
					</li>
				) }
			</ul>

			<Panel className="jetpack-ai-review-mediation__panel">
				<div
					ref={ ( el ) => {
						sectionRefs.current.summary = el;
					} }
				>
					<PanelBody
						title={ __( 'Review summary', 'jetpack' ) }
						className="jetpack-ai-review-mediation__summary"
						opened={ openSections.summary }
						onToggle={ ( next: boolean ) => setSectionOpen( 'summary', next ) }
					>
						<p>{ summary }</p>
						{ cached_at && (
							<p
								className="jetpack-ai-review-mediation__cached-hint"
								title={ __(
									'The inputs (post content, notes, comments, guidelines) have not changed since the previous run, so the saved result is being reused to avoid a duplicate LLM call.',
									'jetpack'
								) }
							>
								{ sprintf(
									/* translators: %s is a short relative-time phrase, e.g. "3 minutes ago" */
									__( 'Reusing review from %s. Edit the post to re-run.', 'jetpack' ),
									formatRelativeTime( cached_at )
								) }
							</p>
						) }
					</PanelBody>
				</div>

				{ hasNoReviewerInput ? null : (
					<>
						{ conflicts.length > 0 && (
							<div
								ref={ ( el ) => {
									sectionRefs.current.conflicts = el;
								} }
							>
								<PanelBody
									title={ __( 'Conflicts', 'jetpack' ) }
									className="jetpack-ai-review-mediation__conflicts"
									opened={ openSections.conflicts }
									onToggle={ ( next: boolean ) => setSectionOpen( 'conflicts', next ) }
								>
									{ conflicts.map( ( conflict, i ) => {
										const status = conflictStatuses[ i ] ?? 'pending';
										const candidates = conflict.candidate_resolutions ?? [];
										const getCandidateDisabledReason = ( candidate: CandidateResolution ) =>
											getBlockEditDisabledReason( candidate.block_index, candidate.current_text );
										const candidateStates = candidates.map( ( candidate ) => ( {
											candidate,
											disabledReason: getCandidateDisabledReason( candidate ),
										} ) );
										const blockCandidateStates = candidateStates.filter(
											( state ) => state.candidate.block_index !== null
										);
										const reviewerCandidateStates = candidateStates.filter(
											( state ) => state.candidate.source === 'reviewer' && ! state.disabledReason
										);
										const aiCandidateState = candidateStates.find(
											( state ) => state.candidate.source === 'ai' && ! state.disabledReason
										);
										const aiCandidate = aiCandidateState?.candidate;
										// Block reference for the card header — prefer the AI candidate's
										// target, fall back to the first candidate with a block. A disabled
										// candidate is still useful here because the header only needs context.
										const headerCandidateState =
											blockCandidateStates.find( ( state ) => state.candidate.source === 'ai' ) ??
											blockCandidateStates[ 0 ];
										const headerBlockIndex = headerCandidateState?.candidate.block_index ?? null;
										const actionsDisabled =
											isPostStale ||
											status === 'applying' ||
											status === 'accepted' ||
											status === 'dismissed' ||
											bulkRunning;
										const hasActionableCandidate =
											reviewerCandidateStates.length > 0 || !! aiCandidate;
										// When some candidates are unavailable but at least one is actionable,
										// keep the card focused on the available action; the prose still carries
										// the full conflict guidance.
										const applyUnavailableReason = hasActionableCandidate
											? undefined
											: getConflictApplyUnavailableReason(
													candidateStates.map( ( state ) => state.disabledReason )
											  ) || __( 'Needs manual edit.', 'jetpack' );
										const applyUnavailableReasonId = `review-mediation-conflict-${ i }-apply-reason`;
										const isCollapsed = status === 'accepted' || status === 'dismissed';
										if ( isCollapsed ) {
											return (
												<article
													className={ `jetpack-ai-review-mediation__conflict-card is-${ status } is-collapsed` }
													key={ `conflict-${ i }` }
												>
													<span
														className="jetpack-ai-review-mediation__collapsed-icon"
														aria-hidden="true"
													>
														{ status === 'accepted' ? '✓' : '×' }
													</span>
													<span className="jetpack-ai-review-mediation__collapsed-status">
														{ status === 'accepted'
															? __( 'Accepted', 'jetpack' )
															: __( 'Dismissed', 'jetpack' ) }
													</span>
													<span
														className="jetpack-ai-review-mediation__collapsed-sep"
														aria-hidden="true"
													>
														·
													</span>
													{ headerBlockIndex !== null && (
														<>
															<BlockRef
																index={ headerBlockIndex }
																blocks={ blocks }
																onFocus={ focusCurrentPostBlock }
															/>
															<span
																className="jetpack-ai-review-mediation__collapsed-sep"
																aria-hidden="true"
															>
																·
															</span>
														</>
													) }
													<span className="jetpack-ai-review-mediation__collapsed-snippet">
														{ truncateText( conflict.subject ) }
													</span>
													<button
														type="button"
														className="jetpack-ai-review-mediation__collapsed-undo"
														disabled={ isPostStale }
														onClick={ () => handleUndoConflict( i ) }
														title={
															status === 'accepted'
																? __(
																		'Revert the block change and re-show this conflict.',
																		'jetpack'
																  )
																: __( 'Re-show this conflict.', 'jetpack' )
														}
													>
														{ __( 'Undo', 'jetpack' ) }
													</button>
												</article>
											);
										}
										return (
											<article
												className={ `jetpack-ai-review-mediation__conflict-card is-${ status }` }
												key={ `conflict-${ i }` }
											>
												<header className="jetpack-ai-review-mediation__conflict-header">
													<span
														className="jetpack-ai-review-mediation__conflict-icon"
														aria-hidden="true"
													>
														⚠
													</span>
													<h4 className="jetpack-ai-review-mediation__conflict-title">
														{ conflict.subject }
													</h4>
													{ headerBlockIndex !== null && (
														<BlockRef
															index={ headerBlockIndex }
															blocks={ blocks }
															onFocus={ focusCurrentPostBlock }
															className="jetpack-ai-review-mediation__conflict-block-ref"
														/>
													) }
												</header>
												<ul className="jetpack-ai-review-mediation__positions">
													{ conflict.positions.map( ( pos, j ) => (
														<li
															className="jetpack-ai-review-mediation__position"
															key={ `pos-${ i }-${ j }` }
														>
															<ReviewerChip
																name={ pos.reviewer }
																metadata={ getReviewerMetadata( pos.reviewer ) }
															/>
															<span className="jetpack-ai-review-mediation__position-text">
																{ pos.position }
															</span>
														</li>
													) ) }
												</ul>

												{ ( aiCandidate || conflict.recommended_resolution ) && (
													<div className="jetpack-ai-review-mediation__ai-inset">
														<p className="jetpack-ai-review-mediation__ai-label">
															<span className="jetpack-ai-review-mediation__ai-badge">
																{ __( 'AI', 'jetpack' ) }
															</span>{ ' ' }
															{ __( 'Recommended resolution', 'jetpack' ) }
														</p>
														<p className="jetpack-ai-review-mediation__ai-text">
															{ aiCandidate?.text || conflict.recommended_resolution }
														</p>
														{ conflict.guideline_anchor && (
															<blockquote className="jetpack-ai-review-mediation__guideline-anchor">
																{ conflict.guideline_anchor }
															</blockquote>
														) }
													</div>
												) }

												{ applyUnavailableReason && (
													<p
														id={ applyUnavailableReasonId }
														className="jetpack-ai-review-mediation__status is-manual"
													>
														{ applyUnavailableReason }
													</p>
												) }

												<div className="jetpack-ai-review-mediation__actions">
													{ reviewerCandidateStates.map( ( { candidate }, k ) => {
														return (
															<button
																type="button"
																className="jetpack-ai-review-mediation__action is-reviewer"
																key={ `candidate-${ i }-${ k }` }
																disabled={ actionsDisabled }
																onClick={ () => handleAcceptCandidate( i, candidate ) }
															>
																{ sprintf(
																	/* translators: %s is a short label, e.g. "Marcus's wording" */
																	__( 'Accept %s', 'jetpack' ),
																	candidate.label
																) }
															</button>
														);
													} ) }
													{ aiCandidate && (
														<button
															type="button"
															className="jetpack-ai-review-mediation__action is-accept"
															disabled={ actionsDisabled }
															onClick={ () => handleAcceptCandidate( i, aiCandidate ) }
														>
															{ getAiButtonLabel( status ) }
														</button>
													) }
													<button
														type="button"
														className="jetpack-ai-review-mediation__action is-dismiss"
														disabled={ actionsDisabled }
														onClick={ () => handleDismissConflict( i ) }
													>
														{ /* status can never be 'dismissed' here — the
														collapsed branch above renders for that case */ }
														{ __( 'Dismiss', 'jetpack' ) }
													</button>
												</div>
											</article>
										);
									} ) }
								</PanelBody>
							</div>
						) }

						{ implications.length > 0 && (
							<div
								ref={ ( el ) => {
									sectionRefs.current.implications = el;
								} }
							>
								<PanelBody
									title={ __( 'Implications', 'jetpack' ) }
									className="jetpack-ai-review-mediation__implications"
									opened={ openSections.implications }
									onToggle={ ( next: boolean ) => setSectionOpen( 'implications', next ) }
								>
									<ul>
										{ implications.map( ( imp, i ) => (
											<li key={ `imp-${ i }` }>
												<strong>{ imp.change }</strong> — { imp.implies }
												{ imp.affected_blocks.length > 0 && (
													<span className="jetpack-ai-review-mediation__affected-blocks">
														{ ' ' }
														{ __( 'Affects:', 'jetpack' ) }{ ' ' }
														{ imp.affected_blocks.map( ( b, j ) => (
															<span key={ `imp-${ i }-aff-${ j }` }>
																{ j > 0 && ', ' }
																<BlockRef
																	index={ b }
																	blocks={ blocks }
																	onFocus={ focusCurrentPostBlock }
																/>
															</span>
														) ) }
													</span>
												) }
											</li>
										) ) }
									</ul>
								</PanelBody>
							</div>
						) }

						{ suggested_edits.length > 0 && (
							<div
								ref={ ( el ) => {
									sectionRefs.current.edits = el;
								} }
							>
								<PanelBody
									title={ __( 'Suggested edits', 'jetpack' ) }
									className="jetpack-ai-review-mediation__edits"
									opened={ openSections.edits }
									onToggle={ ( next: boolean ) => setSectionOpen( 'edits', next ) }
								>
									{ suggested_edits.map( ( edit, i ) => {
										const status = editStatuses[ i ] ?? 'pending';
										const isManual = isManualSuggestedEdit( edit );
										const isPostWide = edit.block_index === null;
										const acceptDisabledReason = isManual
											? undefined
											: getBlockEditDisabledReason( edit.block_index, edit.current_text );
										const applyUnavailableReason = getSuggestedEditApplyUnavailableReason(
											isManual,
											acceptDisabledReason
										);
										const applyUnavailableReasonId = `review-mediation-edit-${ i }-apply-reason`;
										const clickable = ! isPostWide;
										const isCollapsed = status === 'accepted' || status === 'dismissed';
										const acceptDisabled =
											isPostStale ||
											!! acceptDisabledReason ||
											status === 'applying' ||
											status === 'accepted' ||
											status === 'dismissed' ||
											bulkRunning;
										const dismissDisabled =
											isPostStale ||
											status === 'applying' ||
											status === 'accepted' ||
											status === 'dismissed' ||
											bulkRunning;
										if ( isCollapsed ) {
											// Compact row for done items. Undo on accepted rows reverts
											// the block content via the pre-accept snapshot.
											return (
												<article
													className={ `jetpack-ai-review-mediation__card is-${ status } is-collapsed` }
													key={ `edit-${ i }` }
												>
													<span
														className="jetpack-ai-review-mediation__collapsed-icon"
														aria-hidden="true"
													>
														{ status === 'accepted' ? '✓' : '×' }
													</span>
													<span className="jetpack-ai-review-mediation__collapsed-status">
														{ status === 'accepted'
															? __( 'Accepted', 'jetpack' )
															: __( 'Dismissed', 'jetpack' ) }
													</span>
													<span
														className="jetpack-ai-review-mediation__collapsed-sep"
														aria-hidden="true"
													>
														·
													</span>
													<BlockRef
														index={ edit.block_index }
														blocks={ blocks }
														onFocus={ clickable ? focusCurrentPostBlock : undefined }
													/>
													{ edit.suggested_text && (
														<>
															<span
																className="jetpack-ai-review-mediation__collapsed-sep"
																aria-hidden="true"
															>
																·
															</span>
															<span className="jetpack-ai-review-mediation__collapsed-snippet">
																“{ truncateText( edit.suggested_text ) }”
															</span>
														</>
													) }
													<button
														type="button"
														className="jetpack-ai-review-mediation__collapsed-undo"
														disabled={ isPostStale }
														onClick={ () => handleUndoEdit( i ) }
														title={
															status === 'accepted'
																? __(
																		'Revert the block change and re-show this suggestion.',
																		'jetpack'
																  )
																: __( 'Re-show this suggestion.', 'jetpack' )
														}
													>
														{ __( 'Undo', 'jetpack' ) }
													</button>
												</article>
											);
										}
										return (
											<article
												className={ `jetpack-ai-review-mediation__card is-${ status }${
													isManual ? ' is-manual' : ''
												}` }
												key={ `edit-${ i }` }
											>
												<p className="jetpack-ai-review-mediation__block-ref">
													<BlockRef
														index={ edit.block_index }
														blocks={ blocks }
														onFocus={ clickable ? focusCurrentPostBlock : undefined }
													/>
												</p>
												{ edit.current_text && (
													<p className="jetpack-ai-review-mediation__current">
														<del>{ edit.current_text }</del>
													</p>
												) }
												<p
													className={ `jetpack-ai-review-mediation__suggested${
														isManual ? ' is-manual' : ''
													}` }
												>
													{ isManual ? edit.suggested_text : <ins>{ edit.suggested_text }</ins> }
												</p>
												<p className="jetpack-ai-review-mediation__rationale">{ edit.rationale }</p>
												{ applyUnavailableReason && (
													<p
														id={ applyUnavailableReasonId }
														className="jetpack-ai-review-mediation__status is-manual"
													>
														{ applyUnavailableReason }
													</p>
												) }
												{ status === 'failed' && (
													<p className="jetpack-ai-review-mediation__status is-failed">
														{ __(
															'Could not apply automatically. The original text may have changed.',
															'jetpack'
														) }
													</p>
												) }
												{ edit.supported_by_reviewers.length > 0 && (
													<p className="jetpack-ai-review-mediation__reviewers">
														{ __( 'Requested by:', 'jetpack' ) }{ ' ' }
														{ edit.supported_by_reviewers.map( ( r, j ) => (
															<span key={ `edit-${ i }-rev-${ j }` }>
																{ j > 0 && ' ' }
																<ReviewerChip
																	name={ r }
																	metadata={ getReviewerMetadata( r ) }
																	variant="compact"
																/>
															</span>
														) ) }
													</p>
												) }
												<div className="jetpack-ai-review-mediation__actions">
													{ ! isManual && (
														<button
															type="button"
															className="jetpack-ai-review-mediation__action is-accept"
															disabled={ acceptDisabled }
															aria-describedby={
																acceptDisabledReason ? applyUnavailableReasonId : undefined
															}
															onClick={ () => handleAcceptEdit( edit, i ) }
														>
															{ /* `accepted`/`dismissed` are unreachable here — the
																collapsed branch above renders for those */ }
															{ status === 'applying' && __( 'Applying…', 'jetpack' ) }
															{ status === 'failed' && __( 'Retry', 'jetpack' ) }
															{ status === 'pending' && __( 'Accept', 'jetpack' ) }
														</button>
													) }
													<button
														type="button"
														className="jetpack-ai-review-mediation__action is-dismiss"
														disabled={ dismissDisabled }
														onClick={ () => handleDismissEdit( i ) }
													>
														{ __( 'Dismiss', 'jetpack' ) }
													</button>
												</div>
											</article>
										);
									} ) }
								</PanelBody>
							</div>
						) }

						{ renderedGuidelineViolations.length > 0 && (
							<div
								ref={ ( el ) => {
									sectionRefs.current.violations = el;
								} }
							>
								<PanelBody
									title={ `${ __( 'Guideline violations', 'jetpack' ) } (${
										renderedGuidelineViolations.length
									})` }
									className="jetpack-ai-review-mediation__violations"
									opened={ openSections.violations }
									onToggle={ ( next: boolean ) => setSectionOpen( 'violations', next ) }
								>
									<ul className="jetpack-ai-review-mediation__violations-list">
										{ renderedGuidelineViolations.map( ( v, i ) => (
											<li key={ `violation-${ i }` }>
												<p className="jetpack-ai-review-mediation__violation-issue">
													<span
														className={ `jetpack-ai-review-mediation__category-pill is-${ v.category }` }
													>
														{ getGuidelineCategoryLabel( v.category ) }
													</span>
													{ v.block_name && (
														<span className="jetpack-ai-review-mediation__violation-block-name">
															{ v.block_name }
														</span>
													) }{ ' ' }
													{ v.issue }
													{ v.block_index !== null && (
														<>
															{ ' ' }
															<BlockRef
																index={ v.block_index }
																blocks={ blocks }
																onFocus={ focusCurrentPostBlock }
															/>
														</>
													) }
												</p>
												{ hasRenderableGuidelineQuote( v.guideline_quote ) && (
													<blockquote className="jetpack-ai-review-mediation__guideline-anchor">
														{ v.guideline_quote }
													</blockquote>
												) }
												{ v.violating_text && (
													<blockquote
														className="jetpack-ai-review-mediation__violating-text"
														aria-label={ __( 'Excerpt that violates the guideline', 'jetpack' ) }
													>
														{ v.violating_text }
													</blockquote>
												) }
											</li>
										) ) }
									</ul>
								</PanelBody>
							</div>
						) }
					</>
				) }
			</Panel>

			{ totalPendingCount > 0 && (
				<footer className="jetpack-ai-review-mediation__footer">
					<button
						type="button"
						className="jetpack-ai-review-mediation__footer-action is-accept"
						disabled={ isPostStale || bulkRunning || totalPendingCount === 0 }
						onClick={ handleAcceptAllAi }
					>
						{ bulkRunning
							? __( 'Applying…', 'jetpack' )
							: sprintf(
									/* translators: %d is the count of pending AI-resolution + suggested-edit items */
									__( 'Accept all AI resolutions (%d)', 'jetpack' ),
									totalPendingCount
							  ) }
					</button>
				</footer>
			) }
		</div>
	);
}
