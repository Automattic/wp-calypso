/**
 * AiEditorialReview — renders the AI Editorial Review card. Mounted by
 * `getChatComponent('ai-editorial-review')` from a show-component response.
 */

/**
 * External dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, check, undo } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import {
	applyReviewEdit,
	clearActiveBlockFocus,
	clearActiveBlockFocusUnlessBlockReferenceClick,
	getEditableBlockContent,
	hasEditableBlockTarget,
	toggleBlockReferenceFocus,
	undoBlockEdit,
} from '../utils/block-actions';
import {
	countOccurrences,
	flattenBlocks,
	getEditorContentBlocks,
	type BlockEditorStore,
	type EditorStore,
} from '../utils/blocks';
import {
	trackAiEditorialReviewItemAction,
	trackAiEditorialReviewResultRendered,
	type ReviewContext,
} from '../utils/tracking';
import { useCopyToClipboard } from '../utils/use-copy-to-clipboard';
import BlockRef, { getBlockTypeName, type BlockSnapshot } from './block-ref';
import ReviewCard, { type ReviewCardRow } from './review-card';
import ReviewerChip, { type ReviewerMetadata } from './reviewer-chip';

/**
 * Types mirroring the wpcom `AI_Editorial_Review_Ability` structured output.
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
	editable_attribute?: string;
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
	editable_attribute?: string;
	current_text: string;
	suggested_text: string;
	rationale: string;
	supported_by_reviewers: string[];
	requires_manual?: boolean;
	/** Optional short editorial category for the card badge (e.g. "Tone"). */
	feedback_category?: string;
}

interface GuidelineViolation {
	category: 'site' | 'copy' | 'images' | 'additional' | 'block';
	block_name: string | null;
	guideline_quote: string | null;
	block_index: number | null;
	violating_text: string;
	issue: string;
}

type EditorPostId = number | string;

interface AiEditorialReviewProps {
	summary: string;
	conflicts: Conflict[];
	implications: Implication[];
	suggested_edits: SuggestedEdit[];
	guideline_violations: GuidelineViolation[];
	review_context?: ReviewContext;
	/** Source post the review was generated for. Used to detect navigation to a different post. */
	postId?: EditorPostId;
	/**
	 * Server-built map keyed by reviewer display name. Optional — older
	 * reviews or the empty-state payload may omit it; consumers degrade
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
type WpCurrentPostStore = { getCurrentPostId?: () => EditorPostId | null };
type WpGlobal = Window & {
	wp?: {
		data?: {
			select?: ( store: string ) => WpCurrentPostStore | undefined;
		};
	};
};

function normalizeEditorPostId( postId: unknown ): EditorPostId | undefined {
	if ( typeof postId === 'number' && postId > 0 ) {
		return postId;
	}
	if ( typeof postId === 'string' && postId.trim() ) {
		return postId;
	}
	return undefined;
}

function getCurrentEditorPostIdFromStore(): EditorPostId | undefined {
	if ( typeof window === 'undefined' ) {
		return undefined;
	}
	const wp = ( window as WpGlobal ).wp;
	return normalizeEditorPostId( wp?.data?.select?.( 'core/editor' )?.getCurrentPostId?.() );
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
		return __( 'just now', __i18n_text_domain__ );
	}
	const minutes = Math.round( deltaSeconds / 60 );
	if ( minutes < 60 ) {
		return sprintf(
			/* translators: %d is a minute count */
			_n( '%d minute ago', '%d minutes ago', minutes, __i18n_text_domain__ ),
			minutes
		);
	}
	const hours = Math.round( minutes / 60 );
	if ( hours < 24 ) {
		return sprintf(
			/* translators: %d is an hour count */
			_n( '%d hour ago', '%d hours ago', hours, __i18n_text_domain__ ),
			hours
		);
	}
	const days = Math.round( hours / 24 );
	return sprintf(
		/* translators: %d is a day count */
		_n( '%d day ago', '%d days ago', days, __i18n_text_domain__ ),
		days
	);
}

function getGuidelineCategoryLabel( category: GuidelineViolation[ 'category' ] ): string {
	switch ( category ) {
		case 'site':
			return __( 'Site', __i18n_text_domain__ );
		case 'copy':
			return __( 'Copy', __i18n_text_domain__ );
		case 'images':
			return __( 'Images', __i18n_text_domain__ );
		case 'additional':
			return __( 'Additional', __i18n_text_domain__ );
		case 'block':
			return __( 'Block', __i18n_text_domain__ );
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
			return __( 'Applying…', __i18n_text_domain__ );
		case 'accepted':
			return __( 'Accepted', __i18n_text_domain__ );
		case 'failed':
			return __( 'Retry AI resolution', __i18n_text_domain__ );
		default:
			return __( 'Accept AI resolution', __i18n_text_domain__ );
	}
}

function getTextTargetDisabledReason(
	block: BlockSnapshot | null,
	currentText?: string,
	editableAttribute?: string
): string | undefined {
	if ( typeof currentText !== 'string' || currentText === '' ) {
		return __( 'Needs manual edit — no exact source text', __i18n_text_domain__ );
	}
	if ( ! hasEditableBlockTarget( block, editableAttribute, currentText ) ) {
		return __( 'Needs manual edit — unsupported edit target', __i18n_text_domain__ );
	}
	const occurrences = countOccurrences(
		getEditableBlockContent( block, editableAttribute, currentText ),
		currentText
	);
	if ( occurrences === 0 ) {
		return __( 'Needs manual edit — source text changed', __i18n_text_domain__ );
	}
	if ( occurrences > 1 ) {
		return __( 'Needs manual edit — source text appears more than once', __i18n_text_domain__ );
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
	return __( 'Some resolutions need manual edit.', __i18n_text_domain__ );
}

/**
 * Main component.
 * @param {AiEditorialReviewProps} props - Structured review output.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function AiEditorialReview( {
	summary,
	conflicts,
	implications,
	suggested_edits,
	guideline_violations,
	review_context,
	postId,
	reviewers_metadata,
	cached_at,
}: AiEditorialReviewProps ) {
	// Review actions are only safe when the result can be tied to the current editor entity.
	const currentPostId = useSelect( ( select ) => {
		const editor = select( 'core/editor' ) as WpCurrentPostStore;
		return normalizeEditorPostId( editor?.getCurrentPostId?.() );
	}, [] );
	const isPostStale = ! postId || ! currentPostId || String( postId ) !== String( currentPostId );
	const isLatestPostContextStale = useCallback( () => {
		// Async edit guards must read the editor store at call time so navigation
		// between the click and delayed block write is observed immediately.
		const latestCurrentPostId = getCurrentEditorPostIdFromStore() ?? currentPostId;
		return ! postId || ! latestCurrentPostId || String( postId ) !== String( latestCurrentPostId );
	}, [ currentPostId, postId ] );

	const [ editStatuses, setEditStatuses ] = useState< Record< number, EditStatus > >( {} );
	const [ conflictStatuses, setConflictStatuses ] = useState< Record< number, EditStatus > >( {} );
	// Guideline violations are advisory (no apply); they can only be Dismissed/Undone.
	const [ violationStatuses, setViolationStatuses ] = useState< Record< number, EditStatus > >(
		{}
	);
	const [ bulkRunning, setBulkRunning ] = useState( false );
	// Only one card shows "Copied" at a time; the shared hook owns that state.
	const { clipboardSupported, copiedKey, copy: copyToClipboard } = useCopyToClipboard();

	type UndoSnapshot = {
		clientId: string;
		contentBefore: string;
		contentAfter: string;
		editableAttribute?: string;
	};
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
	// Matches wpcom's recursive AI_Editorial_Review_Ability::extract_blocks() order.
	const blocks = useSelect( ( select ) => {
		const contentBlocks = getEditorContentBlocks(
			select( 'core/block-editor' ) as BlockEditorStore,
			select( 'core/editor' ) as EditorStore
		);
		return flattenBlocks( contentBlocks );
	}, [] );

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
		(
			blockIndex: number | null,
			currentText?: string,
			editableAttribute?: string
		): string | undefined => {
			if ( blockIndex === null ) {
				return __( 'Needs manual edit — no single block target', __i18n_text_domain__ );
			}
			const block = getBlock( blockIndex );
			if ( ! block ) {
				return __( 'Needs manual edit — block no longer present', __i18n_text_domain__ );
			}
			return getTextTargetDisabledReason( block, currentText, editableAttribute );
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
			toggleBlockReferenceFocus( clientId );
		},
		[ getClientId, isPostStale ]
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

	const handleRootMouseDown = useCallback( ( event: { target: EventTarget | null } ) => {
		clearActiveBlockFocusUnlessBlockReferenceClick( event.target );
	}, [] );

	// Clear sidebar-created block focus when the review session ends.
	useEffect( () => {
		return () => {
			clearActiveBlockFocus();
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
			currentText?: string,
			editableAttribute?: string
		): Promise< {
			success: boolean;
			clientId?: string;
			contentBefore?: string;
			contentAfter?: string;
			editableAttribute?: string;
		} > => {
			if ( isPostStale || isLatestPostContextStale() ) {
				return { success: false };
			}
			if ( getBlockEditDisabledReason( blockIndex, currentText, editableAttribute ) ) {
				return { success: false };
			}
			const clientId = getClientId( blockIndex );
			if ( ! clientId ) {
				return { success: false };
			}
			try {
				const result = await applyReviewEdit(
					clientId,
					text,
					undefined,
					currentText,
					() => {
						return ! isLatestPostContextStale();
					},
					editableAttribute
				);
				if ( isLatestPostContextStale() ) {
					return { success: false };
				}
				if ( result?.success ) {
					return {
						success: true,
						clientId: result.clientId ?? clientId,
						contentBefore: result.contentBefore,
						contentAfter: result.contentAfter,
						editableAttribute: result.editableAttribute,
					};
				}
				if ( result?.error ) {
					// eslint-disable-next-line no-console
					console.warn( '[AiEditorialReview] applyReviewEdit failed', result.error );
				}
				return { success: false };
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.warn( '[AiEditorialReview] applyReviewEdit threw', err );
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
				edit.current_text,
				edit.editable_attribute
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
					editableAttribute: result.editableAttribute,
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
				if (
					! undoBlockEdit(
						snap.clientId,
						snap.contentBefore,
						snap.contentAfter,
						snap.editableAttribute
					)
				) {
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

	const handleDismissViolation = useCallback(
		( index: number ) => {
			if ( isPostStale ) {
				return;
			}
			setViolationStatuses( ( prev ) => ( { ...prev, [ index ]: 'dismissed' } ) );
		},
		[ isPostStale ]
	);
	const handleUndoViolation = useCallback( ( index: number ) => {
		setViolationStatuses( ( prev ) => ( { ...prev, [ index ]: 'pending' } ) );
	}, [] );

	// ---------- Conflict handlers ----------
	const handleAcceptCandidate = useCallback(
		async ( conflictIndex: number, candidate: CandidateResolution ) => {
			if ( isPostStale ) {
				return;
			}
			if (
				getBlockEditDisabledReason(
					candidate.block_index,
					candidate.current_text,
					candidate.editable_attribute
				)
			) {
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
				candidate.current_text,
				candidate.editable_attribute
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
					editableAttribute: result.editableAttribute,
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
				if (
					! undoBlockEdit(
						snap.clientId,
						snap.contentBefore,
						snap.contentAfter,
						snap.editableAttribute
					)
				) {
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
				( c ) =>
					c.source === 'ai' &&
					! getBlockEditDisabledReason( c.block_index, c.current_text, c.editable_attribute )
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
			return getBlockEditDisabledReason(
				edit.block_index,
				edit.current_text,
				edit.editable_attribute
			)
				? acc
				: acc + 1;
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
						c.source === 'ai' &&
						! getBlockEditDisabledReason( c.block_index, c.current_text, c.editable_attribute )
				);
				if ( ! aiCandidate ) {
					continue;
				}
				setConflictStatus( i, 'applying' );
				// eslint-disable-next-line no-await-in-loop
				const result = await applyTextToBlock(
					aiCandidate.block_index,
					aiCandidate.text,
					aiCandidate.current_text,
					aiCandidate.editable_attribute
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
						editableAttribute: result.editableAttribute,
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
				if (
					getBlockEditDisabledReason( edit.block_index, edit.current_text, edit.editable_attribute )
				) {
					continue;
				}
				setEditStatus( i, 'applying' );
				// eslint-disable-next-line no-await-in-loop
				const result = await applyTextToBlock(
					edit.block_index,
					edit.suggested_text,
					edit.current_text,
					edit.editable_attribute
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
						editableAttribute: result.editableAttribute,
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
			className={ `jetpack-ai-editorial-review${ isPostStale ? ' is-post-stale' : '' }` }
			aria-disabled={ isPostStale || undefined }
			onMouseDownCapture={ handleRootMouseDown }
		>
			{ isPostStale && (
				<p className="jetpack-ai-editorial-review__stale-warning" role="note">
					{ __(
						'Review context changed. Start a new chat and re-run this review.',
						__i18n_text_domain__
					) }
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
				className="jetpack-ai-editorial-review__stats"
				aria-label={ __( 'Review stats', __i18n_text_domain__ ) }
			>
				{ conflicts.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-editorial-review__stat is-conflicts is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'conflicts' ) }
							title={ __( 'Jump to conflicts', __i18n_text_domain__ ) }
						>
							<span className="jetpack-ai-editorial-review__stat-count">{ conflicts.length }</span>{ ' ' }
							{ _n( 'conflict', 'conflicts', conflicts.length, __i18n_text_domain__ ) }
						</button>
					</li>
				) }
				{ implications.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-editorial-review__stat is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'implications' ) }
							title={ __( 'Jump to implications', __i18n_text_domain__ ) }
						>
							<span className="jetpack-ai-editorial-review__stat-count">
								{ implications.length }
							</span>{ ' ' }
							{ _n( 'implication', 'implications', implications.length, __i18n_text_domain__ ) }
						</button>
					</li>
				) }
				{ suggested_edits.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-editorial-review__stat is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'edits' ) }
							title={ __( 'Jump to suggested edits', __i18n_text_domain__ ) }
						>
							<span className="jetpack-ai-editorial-review__stat-count">
								{ suggested_edits.length }
							</span>{ ' ' }
							{ _n( 'edit', 'edits', suggested_edits.length, __i18n_text_domain__ ) }
						</button>
					</li>
				) }
				{ renderedGuidelineViolations.length > 0 && (
					<li>
						<button
							type="button"
							className="jetpack-ai-editorial-review__stat is-clickable"
							disabled={ isPostStale }
							onClick={ () => handleStatClick( 'violations' ) }
							title={ __( 'Jump to guideline violations', __i18n_text_domain__ ) }
						>
							<span className="jetpack-ai-editorial-review__stat-count">
								{ renderedGuidelineViolations.length }
							</span>{ ' ' }
							{ _n(
								'violation',
								'violations',
								renderedGuidelineViolations.length,
								__i18n_text_domain__
							) }
						</button>
					</li>
				) }
				{ acceptedCount > 0 && (
					<li className="jetpack-ai-editorial-review__stat is-accepted">
						<span className="jetpack-ai-editorial-review__stat-count">{ acceptedCount }</span>{ ' ' }
						{ __( 'accepted', __i18n_text_domain__ ) }
					</li>
				) }
				{ dismissedCount > 0 && (
					<li className="jetpack-ai-editorial-review__stat is-dismissed">
						<span className="jetpack-ai-editorial-review__stat-count">{ dismissedCount }</span>{ ' ' }
						{ __( 'dismissed', __i18n_text_domain__ ) }
					</li>
				) }
			</ul>

			<Panel className="jetpack-ai-editorial-review__panel">
				<div
					ref={ ( el ) => {
						sectionRefs.current.summary = el;
					} }
				>
					<PanelBody
						title={ __( 'Review summary', __i18n_text_domain__ ) }
						className="jetpack-ai-editorial-review__summary"
						opened={ openSections.summary }
						onToggle={ ( next: boolean ) => setSectionOpen( 'summary', next ) }
					>
						<p>{ summary }</p>
						{ cached_at && (
							<p
								className="jetpack-ai-editorial-review__cached-hint"
								title={ __(
									'The inputs (post content, notes, comments, guidelines) have not changed since the previous run, so the saved result is being reused to avoid a duplicate LLM call.',
									__i18n_text_domain__
								) }
							>
								{ sprintf(
									/* translators: %s is a short relative-time phrase, e.g. "3 minutes ago" */
									__( 'Reusing review from %s. Edit the post to re-run.', __i18n_text_domain__ ),
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
									title={ __( 'Conflicts', __i18n_text_domain__ ) }
									className="jetpack-ai-editorial-review__conflicts"
									opened={ openSections.conflicts }
									onToggle={ ( next: boolean ) => setSectionOpen( 'conflicts', next ) }
								>
									{ conflicts.map( ( conflict, i ) => {
										const status = conflictStatuses[ i ] ?? 'pending';
										const candidates = conflict.candidate_resolutions ?? [];
										const getCandidateDisabledReason = ( candidate: CandidateResolution ) =>
											getBlockEditDisabledReason(
												candidate.block_index,
												candidate.current_text,
												candidate.editable_attribute
											);
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
											  ) || __( 'Needs manual edit.', __i18n_text_domain__ );
										const applyUnavailableReasonId = `ai-editorial-review-conflict-${ i }-apply-reason`;
										const isResolved = status === 'accepted' || status === 'dismissed';
										if ( isResolved ) {
											return (
												<article
													className={ `jetpack-ai-editorial-review__conflict-card is-${ status } is-resolved` }
													key={ `conflict-${ i }` }
												>
													<header className="jetpack-ai-editorial-review__conflict-header">
														<span
															className="jetpack-ai-editorial-review__conflict-icon"
															aria-hidden="true"
														>
															⚠
														</span>
														<h4 className="jetpack-ai-editorial-review__conflict-title">
															{ conflict.subject }
														</h4>
														{ headerBlockIndex !== null && (
															<BlockRef
																index={ headerBlockIndex }
																blocks={ blocks }
																onFocus={ focusCurrentPostBlock }
																className="jetpack-ai-editorial-review__conflict-block-ref"
															/>
														) }
													</header>
													<div className="jetpack-ai-editorial-review__actions">
														<span
															className={ `jetpack-ai-editorial-review__resolution is-${ status }` }
														>
															{ status === 'accepted' && (
																<Icon
																	className="jetpack-ai-editorial-review__resolution-check"
																	icon={ check }
																	size={ 20 }
																/>
															) }
															{ status === 'accepted'
																? __( 'Applied', __i18n_text_domain__ )
																: __( 'Dismissed', __i18n_text_domain__ ) }
														</span>
														<button
															type="button"
															className="jetpack-ai-editorial-review__resolution-undo"
															disabled={ isPostStale || bulkRunning }
															onClick={ () => handleUndoConflict( i ) }
															title={
																status === 'accepted'
																	? __(
																			'Revert the block change and re-show this conflict.',
																			__i18n_text_domain__
																	  )
																	: __( 'Re-show this conflict.', __i18n_text_domain__ )
															}
														>
															<Icon
																className="jetpack-ai-editorial-review__undo-icon"
																icon={ undo }
																size={ 20 }
															/>
															{ __( 'Undo', __i18n_text_domain__ ) }
														</button>
													</div>
												</article>
											);
										}
										return (
											<article
												className={ `jetpack-ai-editorial-review__conflict-card is-${ status }` }
												key={ `conflict-${ i }` }
											>
												<header className="jetpack-ai-editorial-review__conflict-header">
													<span
														className="jetpack-ai-editorial-review__conflict-icon"
														aria-hidden="true"
													>
														⚠
													</span>
													<h4 className="jetpack-ai-editorial-review__conflict-title">
														{ conflict.subject }
													</h4>
													{ headerBlockIndex !== null && (
														<BlockRef
															index={ headerBlockIndex }
															blocks={ blocks }
															onFocus={ focusCurrentPostBlock }
															className="jetpack-ai-editorial-review__conflict-block-ref"
														/>
													) }
												</header>
												<ul className="jetpack-ai-editorial-review__positions">
													{ conflict.positions.map( ( pos, j ) => (
														<li
															className="jetpack-ai-editorial-review__position"
															key={ `pos-${ i }-${ j }` }
														>
															<ReviewerChip
																name={ pos.reviewer }
																metadata={ getReviewerMetadata( pos.reviewer ) }
															/>
															<span className="jetpack-ai-editorial-review__position-text">
																{ pos.position }
															</span>
														</li>
													) ) }
												</ul>

												{ ( aiCandidate || conflict.recommended_resolution ) && (
													<div className="jetpack-ai-editorial-review__ai-inset">
														<p className="jetpack-ai-editorial-review__ai-label">
															<span className="jetpack-ai-editorial-review__ai-badge">
																{ __( 'AI', __i18n_text_domain__ ) }
															</span>{ ' ' }
															{ __( 'Recommended resolution', __i18n_text_domain__ ) }
														</p>
														<p className="jetpack-ai-editorial-review__ai-text">
															{ aiCandidate?.text || conflict.recommended_resolution }
														</p>
														{ conflict.guideline_anchor && (
															<blockquote className="jetpack-ai-editorial-review__guideline-anchor">
																{ conflict.guideline_anchor }
															</blockquote>
														) }
													</div>
												) }

												{ applyUnavailableReason && (
													<p
														id={ applyUnavailableReasonId }
														className="jetpack-ai-editorial-review__status is-manual"
													>
														{ applyUnavailableReason }
													</p>
												) }

												<div className="jetpack-ai-editorial-review__conflict-resolution">
													{ reviewerCandidateStates.length > 0 && (
														<div className="jetpack-ai-editorial-review__conflict-candidates">
															{ reviewerCandidateStates.map( ( { candidate }, k ) => {
																return (
																	<button
																		type="button"
																		className="jetpack-ai-editorial-review__action is-reviewer"
																		key={ `candidate-${ i }-${ k }` }
																		disabled={ actionsDisabled }
																		onClick={ () => handleAcceptCandidate( i, candidate ) }
																	>
																		{ sprintf(
																			/* translators: %s is a short label, e.g. "Marcus's wording" */
																			__( 'Accept %s', __i18n_text_domain__ ),
																			candidate.label
																		) }
																	</button>
																);
															} ) }
														</div>
													) }
													<div className="jetpack-ai-editorial-review__actions">
														{ aiCandidate && (
															<button
																type="button"
																className="jetpack-ai-editorial-review__action is-accept"
																disabled={ actionsDisabled }
																onClick={ () => handleAcceptCandidate( i, aiCandidate ) }
															>
																{ getAiButtonLabel( status ) }
															</button>
														) }
														<button
															type="button"
															className="jetpack-ai-editorial-review__action is-dismiss"
															disabled={ actionsDisabled }
															onClick={ () => handleDismissConflict( i ) }
														>
															{ /* status can never be 'dismissed' here — the
															collapsed branch above renders for that case */ }
															{ __( 'Dismiss', __i18n_text_domain__ ) }
														</button>
													</div>
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
									title={ __( 'Implications', __i18n_text_domain__ ) }
									className="jetpack-ai-editorial-review__implications"
									opened={ openSections.implications }
									onToggle={ ( next: boolean ) => setSectionOpen( 'implications', next ) }
								>
									<ul>
										{ implications.map( ( imp, i ) => (
											<li key={ `imp-${ i }` }>
												<strong>{ imp.change }</strong> — { imp.implies }
												{ imp.affected_blocks.length > 0 && (
													<span className="jetpack-ai-editorial-review__affected-blocks">
														{ ' ' }
														{ __( 'Affects:', __i18n_text_domain__ ) }{ ' ' }
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
									title={ __( 'Suggested edits', __i18n_text_domain__ ) }
									className="jetpack-ai-editorial-review__edits"
									opened={ openSections.edits }
									onToggle={ ( next: boolean ) => setSectionOpen( 'edits', next ) }
								>
									{ suggested_edits.map( ( edit, i ) => {
										const status = editStatuses[ i ] ?? 'pending';
										const requiresManual = isManualSuggestedEdit( edit );
										const targetBlock =
											edit.block_index !== null ? getBlock( edit.block_index ) : null;
										// Item-level reason it can't be applied (drift / block gone / ambiguous) — not stale.
										const disabledReason = requiresManual
											? undefined
											: getBlockEditDisabledReason(
													edit.block_index,
													edit.current_text,
													edit.editable_attribute
											  );
										// Stale can't apply anything (block refs point at the wrong post) even if the
										// current post still contains the text — so Go to section, never a dead Apply.
										const canApply = ! requiresManual && ! disabledReason && ! isPostStale;
										// Manual tag reflects the edit, not staleness (disabledReason is against the current post).
										const isManualEdit = requiresManual || ( ! isPostStale && !! disabledReason );
										// Keep Apply while an apply is in flight, unless the review went stale mid-apply.
										const showApply = canApply || ( ! isPostStale && status === 'applying' );
										const canGoToSection = !! focusCurrentPostBlock && !! targetBlock;
										// Show the diff only while the exact source text is still present in the post.
										const currentTextPresent =
											!! edit.current_text &&
											!! targetBlock &&
											countOccurrences(
												getEditableBlockContent(
													targetBlock,
													edit.editable_attribute,
													edit.current_text
												),
												edit.current_text
											) >= 1;
										const showDiff = currentTextPresent && !! edit.suggested_text;
										const suggestionText = edit.suggested_text;
										const key = `edit-${ i }`;
										const categoryLabel =
											edit.feedback_category ||
											( targetBlock
												? getBlockTypeName( targetBlock.name ?? '' )
												: __( 'Suggested edit', __i18n_text_domain__ ) );
										const categoryBadge = sprintf(
											/* translators: 1: editorial category, 2: position in the run, 3: total edits. */
											__( '%1$s (%2$d/%3$d)', __i18n_text_domain__ ),
											categoryLabel,
											i + 1,
											suggested_edits.length
										);
										const bodyRows: ReviewCardRow[] = [];
										if ( edit.rationale ) {
											bodyRows.push( {
												tag: __( 'Why', __i18n_text_domain__ ),
												text: edit.rationale,
												variant: 'current',
												element: 'text',
											} );
										}
										if ( showDiff ) {
											bodyRows.push( {
												tag: __( 'Current', __i18n_text_domain__ ),
												text: edit.current_text,
												variant: 'current',
												element: 'del',
											} );
											bodyRows.push( {
												tag: __( 'New', __i18n_text_domain__ ),
												text: edit.suggested_text,
												variant: 'new',
												element: 'ins',
											} );
										} else if ( edit.suggested_text ) {
											bodyRows.push( {
												tag: __( 'Suggestion', __i18n_text_domain__ ),
												text: edit.suggested_text,
												variant: 'new',
												element: 'text',
											} );
										}
										const footer =
											edit.supported_by_reviewers.length > 0 ? (
												<p className="jetpack-ai-editorial-review__reviewers">
													{ __( 'Requested by:', __i18n_text_domain__ ) }{ ' ' }
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
											) : undefined;

										return (
											<ReviewCard
												key={ key }
												model={ {
													badge: categoryBadge,
													isManualEdit,
													blockIndex: edit.block_index,
													bodyRows,
													reasonNote: isPostStale ? undefined : disabledReason,
												} }
												blocks={ blocks }
												status={ status }
												showApply={ showApply }
												canGoToSection={ canGoToSection }
												showCopy={ !! suggestionText && clipboardSupported }
												copied={ copiedKey === key }
												disabled={ isPostStale || bulkRunning }
												failureMessage={ __(
													'Could not apply automatically. The original text may have changed.',
													__i18n_text_domain__
												) }
												onApply={ () => handleAcceptEdit( edit, i ) }
												onGoToSection={ () => focusBlock( edit.block_index ) }
												onCopy={ () => {
													if ( suggestionText ) {
														copyToClipboard( key, suggestionText );
													}
												} }
												onDismiss={ () => handleDismissEdit( i ) }
												onUndo={ () => handleUndoEdit( i ) }
												onFocusBlock={ focusCurrentPostBlock }
												footer={ footer }
											/>
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
									title={ sprintf(
										/* translators: 1: section label, 2: number of violations. */
										__( '%1$s (%2$d)', __i18n_text_domain__ ),
										__( 'Guideline violations', __i18n_text_domain__ ),
										renderedGuidelineViolations.length
									) }
									className="jetpack-ai-editorial-review__violations"
									opened={ openSections.violations }
									onToggle={ ( next: boolean ) => setSectionOpen( 'violations', next ) }
								>
									<div className="jetpack-ai-feedback-list__items">
										{ renderedGuidelineViolations.map( ( v, i ) => {
											const status = violationStatuses[ i ] ?? 'pending';
											const key = `violation-${ i }`;
											const targetBlock = v.block_index !== null ? getBlock( v.block_index ) : null;
											const hasGuideline = hasRenderableGuidelineQuote( v.guideline_quote );
											const bodyRows: ReviewCardRow[] = [];
											bodyRows.push( {
												tag: __( 'Why', __i18n_text_domain__ ),
												text: v.issue,
												variant: 'current',
												element: 'text',
											} );
											if ( v.violating_text ) {
												bodyRows.push( {
													tag: __( 'Current', __i18n_text_domain__ ),
													text: v.violating_text,
													variant: 'current',
													element: 'del',
												} );
											}
											if ( hasGuideline && v.guideline_quote ) {
												bodyRows.push( {
													tag: __( 'Guideline', __i18n_text_domain__ ),
													text: v.guideline_quote,
													variant: 'new',
													element: 'text',
												} );
											}
											return (
												<ReviewCard
													key={ key }
													model={ {
														badge: sprintf(
															/* translators: 1: guideline category, 2: position, 3: total violations. */
															__( '%1$s (%2$d/%3$d)', __i18n_text_domain__ ),
															getGuidelineCategoryLabel( v.category ),
															i + 1,
															renderedGuidelineViolations.length
														),
														isManualEdit: false,
														blockIndex: v.block_index,
														bodyRows,
													} }
													blocks={ blocks }
													status={ status }
													showApply={ false }
													canGoToSection={ !! focusCurrentPostBlock && !! targetBlock }
													showCopy={ hasGuideline && clipboardSupported }
													copied={ copiedKey === key }
													disabled={ isPostStale || bulkRunning }
													failureMessage=""
													onApply={ () => undefined }
													onGoToSection={ () => focusBlock( v.block_index ) }
													onCopy={ () => {
														if ( v.guideline_quote ) {
															copyToClipboard( key, v.guideline_quote );
														}
													} }
													onDismiss={ () => handleDismissViolation( i ) }
													onUndo={ () => handleUndoViolation( i ) }
													onFocusBlock={ focusCurrentPostBlock }
												/>
											);
										} ) }
									</div>
								</PanelBody>
							</div>
						) }
					</>
				) }
			</Panel>

			{ totalPendingCount > 0 && (
				<footer className="jetpack-ai-editorial-review__footer">
					<button
						type="button"
						className="jetpack-ai-editorial-review__footer-action is-accept"
						disabled={ isPostStale || bulkRunning || totalPendingCount === 0 }
						onClick={ handleAcceptAllAi }
					>
						{ bulkRunning
							? __( 'Applying…', __i18n_text_domain__ )
							: sprintf(
									/* translators: %d is the count of pending AI-resolution + suggested-edit items */
									__( 'Apply all (%d)', __i18n_text_domain__ ),
									totalPendingCount
							  ) }
					</button>
				</footer>
			) }
		</div>
	);
}
