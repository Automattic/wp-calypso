/**
 * ReviewMediation — renders the multi-reviewer mediation in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response via
 * 'big_sky__show_component' with data.type set to 'review-mediation'.
 *
 * ## Interaction model
 * - Every block reference (suggested edits, implications' `affected_blocks`,
 *   conflict target block, violations) is a `BlockRef`. Click → `focusBlock`
 *   (selectBlock + scrollIntoView + `.is-focus-mode` dim). Cleanup on unmount.
 * - Suggested-edit cards are clickable on the body (outside buttons) to focus
 *   the target block; Accept applies `suggested_text` via `applyReviewEdit`.
 * - Conflict cards surface per-reviewer + AI candidate resolutions. Each
 *   candidate button applies its `text` to the candidate's `block_index`
 *   via `applyReviewEdit`. Dismiss hides the card locally (no backend call).
 * - Footer "Accept all AI resolutions (N)" sequentially applies every pending
 *   AI conflict candidate + every pending suggested edit.
 */

/**
 * External dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useCallback, useEffect, useMemo } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { applyReviewEdit, findBlockElement, findBlockListLayout } from '../index';
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
}

interface GuidelineViolation {
	category: 'site' | 'copy' | 'images' | 'additional' | 'block';
	block_name: string | null;
	guideline_quote: string;
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
	/**
	 * Server-built map keyed by reviewer display name. Optional — older
	 * mediations or the empty-state payload may omit it; consumers degrade
	 * gracefully (fall back to the deterministic-colour pill).
	 */
	reviewers_metadata?: Record< string, ReviewerMetadata >;
	/**
	 * Unix timestamp when the cached mediation was first generated. Only set
	 * when the server short-circuited the LLM call on a state-hash match
	 * (same inputs as the previous run). Absent on fresh runs. The client
	 * renders a subtle "reusing cached run" note so the reviewer knows the
	 * result is deterministic rather than a new analysis.
	 */
	cached_at?: number;
}

type EditStatus = 'pending' | 'applying' | 'accepted' | 'dismissed' | 'failed';

/**
 * Coarse relative-time formatter for the cached-run hint. Kept intentionally
 * local — calypso's `moment` is heavy for a single muted line, and `Intl.RelativeTimeFormat`
 * requires a locale plumbing we don't have here. Rounds to the nearest
 * friendly unit ("just now", "5 minutes ago", "2 hours ago", "yesterday").
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
	reviewers_metadata,
	cached_at,
}: ReviewMediationProps ) {
	const [ editStatuses, setEditStatuses ] = useState< Record< number, EditStatus > >( {} );
	const [ conflictStatuses, setConflictStatuses ] = useState< Record< number, EditStatus > >( {} );
	const [ bulkRunning, setBulkRunning ] = useState( false );

	// Flat list of top-level blocks in document order. `block_index` from the
	// server-side ability (a `parse_blocks()` offset) maps directly to this
	// array's index. Includes `name` + `attributes` so BlockRef can render
	// rich labels like "Heading (H2) — \"…\"" instead of bare indices.
	const blocks = useSelect(
		( select ) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( ( select as any )( 'core/block-editor' ).getBlocks?.() ?? [] ) as BlockSnapshot[],
		[]
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { selectBlock } = useDispatch( 'core/block-editor' ) as any;

	const getClientId = useCallback(
		( blockIndex: number | null ): string | null => {
			if ( blockIndex === null || blockIndex < 0 || blockIndex >= blocks.length ) {
				return null;
			}
			return blocks[ blockIndex ]?.clientId ?? null;
		},
		[ blocks ]
	);

	const focusBlock = useCallback(
		( blockIndex: number | null ) => {
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
		[ getClientId, selectBlock ]
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
		async ( blockIndex: number | null, text: string ): Promise< boolean > => {
			const clientId = getClientId( blockIndex );
			if ( ! clientId ) {
				return false;
			}
			try {
				const result = await applyReviewEdit( clientId, text );
				return !! result?.success;
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] applyReviewEdit threw', err );
				return false;
			}
		},
		[ getClientId ]
	);

	// ---------- Suggested edit handlers ----------
	const handleAcceptEdit = useCallback(
		async ( edit: SuggestedEdit, editIndex: number ) => {
			if ( edit.block_index === null ) {
				setEditStatus( editIndex, 'failed' );
				return;
			}
			setEditStatus( editIndex, 'applying' );
			const ok = await applyTextToBlock( edit.block_index, edit.suggested_text );
			setEditStatus( editIndex, ok ? 'accepted' : 'failed' );
		},
		[ applyTextToBlock, setEditStatus ]
	);
	const handleDismissEdit = useCallback(
		( editIndex: number ) => setEditStatus( editIndex, 'dismissed' ),
		[ setEditStatus ]
	);

	// ---------- Conflict handlers ----------
	const handleAcceptCandidate = useCallback(
		async ( conflictIndex: number, candidate: CandidateResolution ) => {
			if ( candidate.block_index === null ) {
				setConflictStatus( conflictIndex, 'failed' );
				return;
			}
			setConflictStatus( conflictIndex, 'applying' );
			const ok = await applyTextToBlock( candidate.block_index, candidate.text );
			setConflictStatus( conflictIndex, ok ? 'accepted' : 'failed' );
		},
		[ applyTextToBlock, setConflictStatus ]
	);
	const handleDismissConflict = useCallback(
		( conflictIndex: number ) => setConflictStatus( conflictIndex, 'dismissed' ),
		[ setConflictStatus ]
	);

	// ---------- Bulk apply ----------
	const pendingAiConflictCount = useMemo( () => {
		return conflicts.reduce( ( acc, conflict, i ) => {
			const status = conflictStatuses[ i ] ?? 'pending';
			if ( status !== 'pending' && status !== 'failed' ) {
				return acc;
			}
			const aiCandidate = conflict.candidate_resolutions?.find(
				( c ) => c.source === 'ai' && c.block_index !== null
			);
			return aiCandidate ? acc + 1 : acc;
		}, 0 );
	}, [ conflicts, conflictStatuses ] );

	const pendingEditCount = useMemo( () => {
		return suggested_edits.reduce( ( acc, edit, i ) => {
			const status = editStatuses[ i ] ?? 'pending';
			if ( status !== 'pending' && status !== 'failed' ) {
				return acc;
			}
			return edit.block_index !== null ? acc + 1 : acc;
		}, 0 );
	}, [ suggested_edits, editStatuses ] );

	const totalPendingCount = pendingAiConflictCount + pendingEditCount;

	const handleAcceptAllAi = useCallback( async () => {
		if ( bulkRunning || totalPendingCount === 0 ) {
			return;
		}
		setBulkRunning( true );
		// Sequential so users see the shimmer on each block as it applies;
		// parallel would race the same dispatch and confuse the state store.
		for ( let i = 0; i < conflicts.length; i++ ) {
			const status = conflictStatuses[ i ] ?? 'pending';
			if ( status !== 'pending' && status !== 'failed' ) {
				continue;
			}
			const aiCandidate = conflicts[ i ].candidate_resolutions?.find(
				( c ) => c.source === 'ai' && c.block_index !== null
			);
			if ( ! aiCandidate ) {
				continue;
			}
			setConflictStatus( i, 'applying' );
			// eslint-disable-next-line no-await-in-loop
			const ok = await applyTextToBlock( aiCandidate.block_index, aiCandidate.text );
			setConflictStatus( i, ok ? 'accepted' : 'failed' );
		}
		for ( let i = 0; i < suggested_edits.length; i++ ) {
			const status = editStatuses[ i ] ?? 'pending';
			if ( status !== 'pending' && status !== 'failed' ) {
				continue;
			}
			const edit = suggested_edits[ i ];
			if ( edit.block_index === null ) {
				continue;
			}
			setEditStatus( i, 'applying' );
			// eslint-disable-next-line no-await-in-loop
			const ok = await applyTextToBlock( edit.block_index, edit.suggested_text );
			setEditStatus( i, ok ? 'accepted' : 'failed' );
		}
		setBulkRunning( false );
	}, [
		bulkRunning,
		totalPendingCount,
		conflicts,
		conflictStatuses,
		suggested_edits,
		editStatuses,
		applyTextToBlock,
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
		guideline_violations.length === 0;

	// Lookup helper — `reviewers_metadata` may be absent on older payloads.
	const getReviewerMetadata = ( name: string ): ReviewerMetadata | null => {
		return reviewers_metadata?.[ name ] ?? null;
	};

	return (
		<div className="jetpack-ai-review-mediation">
			{ /* ---------- Stats strip ---------- */ }
			<ul
				className="jetpack-ai-review-mediation__stats"
				aria-label={ __( 'Review stats', 'jetpack' ) }
			>
				{ conflicts.length > 0 && (
					<li className="jetpack-ai-review-mediation__stat is-conflicts">
						<span className="jetpack-ai-review-mediation__stat-count">{ conflicts.length }</span>{ ' ' }
						{ _n( 'conflict', 'conflicts', conflicts.length ) }
					</li>
				) }
				{ implications.length > 0 && (
					<li className="jetpack-ai-review-mediation__stat">
						<span className="jetpack-ai-review-mediation__stat-count">{ implications.length }</span>{ ' ' }
						{ _n( 'implication', 'implications', implications.length ) }
					</li>
				) }
				{ suggested_edits.length > 0 && (
					<li className="jetpack-ai-review-mediation__stat">
						<span className="jetpack-ai-review-mediation__stat-count">
							{ suggested_edits.length }
						</span>{ ' ' }
						{ _n( 'edit', 'edits', suggested_edits.length ) }
					</li>
				) }
				{ guideline_violations.length > 0 && (
					<li className="jetpack-ai-review-mediation__stat">
						<span className="jetpack-ai-review-mediation__stat-count">
							{ guideline_violations.length }
						</span>{ ' ' }
						{ _n( 'violation', 'violations', guideline_violations.length ) }
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
				<PanelBody
					title={ __( 'Review summary', 'jetpack' ) }
					className="jetpack-ai-review-mediation__summary"
					initialOpen
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
								__( 'Reusing mediation from %s. Edit the post to re-run.', 'jetpack' ),
								formatRelativeTime( cached_at )
							) }
						</p>
					) }
				</PanelBody>

				{ hasNoReviewerInput ? null : (
					<>
						{ conflicts.length > 0 && (
							<PanelBody
								title={ __( 'Conflicts', 'jetpack' ) }
								className="jetpack-ai-review-mediation__conflicts"
								initialOpen
							>
								{ conflicts.map( ( conflict, i ) => {
									const status = conflictStatuses[ i ] ?? 'pending';
									const candidates = conflict.candidate_resolutions ?? [];
									const reviewerCandidates = candidates.filter(
										( c ) => c.source === 'reviewer' && c.block_index !== null
									);
									const aiCandidate = candidates.find(
										( c ) => c.source === 'ai' && c.block_index !== null
									);
									// Block reference for the card header — prefer the AI candidate's
									// target, fall back to the first reviewer candidate with a block.
									const headerBlockIndex =
										aiCandidate?.block_index ?? reviewerCandidates[ 0 ]?.block_index ?? null;
									const hasAnyAction = reviewerCandidates.length > 0 || !! aiCandidate;
									const actionsDisabled =
										status === 'applying' ||
										status === 'accepted' ||
										status === 'dismissed' ||
										bulkRunning;
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
														onFocus={ focusBlock }
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

											{ hasAnyAction && (
												<div className="jetpack-ai-review-mediation__actions">
													{ reviewerCandidates.map( ( candidate, k ) => (
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
													) ) }
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
														{ status === 'dismissed'
															? __( 'Dismissed', 'jetpack' )
															: __( 'Dismiss', 'jetpack' ) }
													</button>
												</div>
											) }
										</article>
									);
								} ) }
							</PanelBody>
						) }

						{ implications.length > 0 && (
							<PanelBody
								title={ __( 'Implications', 'jetpack' ) }
								className="jetpack-ai-review-mediation__implications"
								initialOpen
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
															<BlockRef index={ b } blocks={ blocks } onFocus={ focusBlock } />
														</span>
													) ) }
												</span>
											) }
										</li>
									) ) }
								</ul>
							</PanelBody>
						) }

						{ suggested_edits.length > 0 && (
							<PanelBody
								title={ __( 'Suggested edits', 'jetpack' ) }
								className="jetpack-ai-review-mediation__edits"
								initialOpen
							>
								{ suggested_edits.map( ( edit, i ) => {
									const status = editStatuses[ i ] ?? 'pending';
									const isPostWide = edit.block_index === null;
									const clickable = ! isPostWide;
									const acceptDisabled =
										isPostWide ||
										status === 'applying' ||
										status === 'accepted' ||
										status === 'dismissed' ||
										bulkRunning;
									const dismissDisabled =
										status === 'applying' ||
										status === 'accepted' ||
										status === 'dismissed' ||
										bulkRunning;
									const onCardClick = ( e: React.MouseEvent< HTMLElement > ) => {
										if ( ( e.target as HTMLElement ).closest( 'button' ) ) {
											return;
										}
										if ( clickable ) {
											focusBlock( edit.block_index );
										}
									};
									return (
										// Intentionally not role="button" — this card contains inner
										// buttons; keyboard users reach the inner buttons directly.
										// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
										<article
											className={ `jetpack-ai-review-mediation__card is-${ status }${
												clickable ? ' is-clickable' : ''
											}` }
											key={ `edit-${ i }` }
											onClick={ onCardClick }
										>
											<p className="jetpack-ai-review-mediation__block-ref">
												<BlockRef
													index={ edit.block_index }
													blocks={ blocks }
													onFocus={ clickable ? focusBlock : undefined }
												/>
											</p>
											{ edit.current_text && (
												<p className="jetpack-ai-review-mediation__current">
													<del>{ edit.current_text }</del>
												</p>
											) }
											<p className="jetpack-ai-review-mediation__suggested">
												<ins>{ edit.suggested_text }</ins>
											</p>
											<p className="jetpack-ai-review-mediation__rationale">{ edit.rationale }</p>
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
												<button
													type="button"
													className="jetpack-ai-review-mediation__action is-accept"
													disabled={ acceptDisabled }
													title={
														isPostWide
															? __( 'Needs manual edit — no single block target', 'jetpack' )
															: undefined
													}
													onClick={ () => handleAcceptEdit( edit, i ) }
												>
													{ status === 'applying' && __( 'Applying…', 'jetpack' ) }
													{ status === 'accepted' && __( 'Accepted', 'jetpack' ) }
													{ status === 'failed' && __( 'Retry', 'jetpack' ) }
													{ ( status === 'pending' || status === 'dismissed' ) &&
														__( 'Accept', 'jetpack' ) }
												</button>
												<button
													type="button"
													className="jetpack-ai-review-mediation__action is-dismiss"
													disabled={ dismissDisabled }
													onClick={ () => handleDismissEdit( i ) }
												>
													{ status === 'dismissed'
														? __( 'Dismissed', 'jetpack' )
														: __( 'Dismiss', 'jetpack' ) }
												</button>
											</div>
										</article>
									);
								} ) }
							</PanelBody>
						) }

						{ guideline_violations.length > 0 && (
							<PanelBody
								title={ `${ __( 'Guideline violations', 'jetpack' ) } (${
									guideline_violations.length
								})` }
								className="jetpack-ai-review-mediation__violations"
								initialOpen
							>
								<ul className="jetpack-ai-review-mediation__violations-list">
									{ guideline_violations.map( ( v, i ) => (
										<li key={ `violation-${ i }` }>
											<p className="jetpack-ai-review-mediation__violation-issue">
												<strong>
													[{ v.category }
													{ v.block_name ? ` · ${ v.block_name }` : '' }]
												</strong>{ ' ' }
												{ v.issue }
												{ v.block_index !== null && (
													<>
														{ ' ' }
														<BlockRef
															index={ v.block_index }
															blocks={ blocks }
															onFocus={ focusBlock }
														/>
													</>
												) }
											</p>
											<blockquote className="jetpack-ai-review-mediation__guideline-anchor">
												{ v.guideline_quote }
											</blockquote>
											{ v.violating_text && (
												<p className="jetpack-ai-review-mediation__current">
													<del>{ v.violating_text }</del>
												</p>
											) }
										</li>
									) ) }
								</ul>
							</PanelBody>
						) }
					</>
				) }
			</Panel>

			{ totalPendingCount > 0 && (
				<footer className="jetpack-ai-review-mediation__footer">
					<button
						type="button"
						className="jetpack-ai-review-mediation__footer-action is-accept"
						disabled={ bulkRunning || totalPendingCount === 0 }
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
