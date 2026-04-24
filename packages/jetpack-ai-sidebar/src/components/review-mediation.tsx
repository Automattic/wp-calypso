/**
 * ReviewMediation — renders the multi-reviewer mediation in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response via
 * 'big_sky__show_component' with data.type set to 'review-mediation'.
 *
 * Shows the summary, reviewer conflicts with recommended resolutions, cascade
 * implications, atomic suggested edits, and a collapsible list of guideline
 * violations grounded in the site's content guidelines.
 *
 * ## Interaction model for suggested edits
 * - Clicking the card body (outside Accept/Dismiss) selects the target block in
 *   the editor, scrolls it into view, and dims every other block via the
 *   `.is-focus-mode` class on the block-list root — mirrors block-notes'
 *   click-to-focus UX. The dim class is cleared on component unmount.
 * - Clicking Accept applies `suggested_text` to the target block via
 *   `applyReviewEdit` (shimmer + checkpoint for Undo).
 * - Clicking Dismiss hides the suggestion locally; no backend call.
 */

/**
 * External dependencies
 */
import { Panel, PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { applyReviewEdit, findBlockElement, findBlockListLayout } from '../index';

const FOCUS_MODE_CLASS = 'is-focus-mode';

/**
 * Types mirroring the wpcom `Review_Mediator_Ability` structured output.
 */
interface ReviewerPosition {
	reviewer: string;
	position: string;
}

interface Conflict {
	subject: string;
	positions: ReviewerPosition[];
	guideline_anchor: string | null;
	recommended_resolution: string;
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
}

type EditStatus = 'pending' | 'applying' | 'accepted' | 'dismissed' | 'failed';

interface BlockSnapshot {
	clientId: string;
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
}: ReviewMediationProps ) {
	const [ editStatuses, setEditStatuses ] = useState< Record< number, EditStatus > >( {} );

	// Flat list of top-level blocks in document order. `block_index` from the
	// server-side ability (a `parse_blocks()` offset) maps directly to this
	// array's index.
	const blocks = useSelect(
		( select ) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( ( select as any )( 'core/block-editor' ).getBlocks?.() ?? [] ) as BlockSnapshot[],
		[]
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { selectBlock } = useDispatch( 'core/block-editor' ) as any;

	const setStatus = useCallback( ( index: number, status: EditStatus ) => {
		setEditStatuses( ( prev ) => ( { ...prev, [ index ]: status } ) );
	}, [] );

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
			// Optional-chaining call is a no-op when dispatch hasn't wired
			// `selectBlock` (e.g. in unit-test environments).
			selectBlock?.( clientId );
			const el = findBlockElement( clientId );
			el?.scrollIntoView?.( { behavior: 'smooth', block: 'center' } );

			// Mirror block-notes' dim-others UX: Gutenberg's built-in
			// `.is-focus-mode` CSS (from block-list/content.scss) drops every
			// non-selected block to opacity 0.2. The class is normally driven
			// by the private `toggleBlockSpotlight` action, which we can't
			// reach without unlocking `@wordpress/private-apis`. Toggling the
			// class directly on the block-list root produces the identical
			// visual effect. Cleanup runs on unmount (below).
			findBlockListLayout()?.classList.add( FOCUS_MODE_CLASS );
		},
		[ getClientId, selectBlock ]
	);

	// Ensure the dim-others effect does not leak past the mediation session.
	useEffect( () => {
		return () => {
			findBlockListLayout()?.classList.remove( FOCUS_MODE_CLASS );
		};
	}, [] );

	const handleAccept = useCallback(
		async ( edit: SuggestedEdit, editIndex: number ) => {
			const clientId = getClientId( edit.block_index );
			if ( ! clientId ) {
				// eslint-disable-next-line no-console
				console.warn(
					'[ReviewMediation] No target block for edit',
					editIndex,
					'block_index=',
					edit.block_index
				);
				setStatus( editIndex, 'failed' );
				return;
			}
			setStatus( editIndex, 'applying' );
			try {
				// Intentionally pass no `summary`: adding an assistant chat message
				// would demote the mediation from `isLastMessage`, which flips AM's
				// `isStale` flag and disables the whole component
				// (see convert-tool-messages-to-components.ts). The rationale is
				// already visible on the card itself.
				const result = await applyReviewEdit( clientId, edit.suggested_text );
				setStatus( editIndex, result?.success ? 'accepted' : 'failed' );
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.warn( '[ReviewMediation] applyReviewEdit threw', err );
				setStatus( editIndex, 'failed' );
			}
		},
		[ getClientId, setStatus ]
	);

	const handleDismiss = useCallback(
		( editIndex: number ) => {
			setStatus( editIndex, 'dismissed' );
		},
		[ setStatus ]
	);

	const hasNoReviewerInput =
		conflicts.length === 0 &&
		implications.length === 0 &&
		suggested_edits.length === 0 &&
		guideline_violations.length === 0;

	return (
		<div className="jetpack-ai-review-mediation">
			<Panel className="jetpack-ai-review-mediation__panel">
				<PanelBody
					title={ __( 'Review summary', 'jetpack' ) }
					className="jetpack-ai-review-mediation__summary"
					initialOpen
				>
					<p>{ summary }</p>
				</PanelBody>

				{ hasNoReviewerInput ? null : (
					<>
						{ conflicts.length > 0 && (
							<PanelBody
								title={ __( 'Conflicts', 'jetpack' ) }
								className="jetpack-ai-review-mediation__conflicts"
								initialOpen
							>
								{ conflicts.map( ( conflict, i ) => (
									<article className="jetpack-ai-review-mediation__card" key={ `conflict-${ i }` }>
										<h4 className="jetpack-ai-review-mediation__card-title">
											{ conflict.subject }
										</h4>
										<ul className="jetpack-ai-review-mediation__positions">
											{ conflict.positions.map( ( pos, j ) => (
												<li key={ `pos-${ i }-${ j }` }>
													<strong>{ pos.reviewer }:</strong> { pos.position }
												</li>
											) ) }
										</ul>
										{ conflict.guideline_anchor && (
											<blockquote className="jetpack-ai-review-mediation__guideline-anchor">
												{ conflict.guideline_anchor }
											</blockquote>
										) }
										<p className="jetpack-ai-review-mediation__recommendation">
											<strong>{ __( 'Recommended:', 'jetpack' ) }</strong>{ ' ' }
											{ conflict.recommended_resolution }
										</p>
									</article>
								) ) }
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
													({ __( 'Affects blocks:', 'jetpack' ) }{ ' ' }
													{ imp.affected_blocks.join( ', ' ) })
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
									// Accept is disabled in states where there's no useful action:
									// post-wide edits (no block target), in-flight edits, or
									// already-resolved edits.
									const acceptDisabled =
										isPostWide ||
										status === 'applying' ||
										status === 'accepted' ||
										status === 'dismissed';
									const dismissDisabled =
										status === 'applying' || status === 'accepted' || status === 'dismissed';
									const onCardClick = ( e: React.MouseEvent< HTMLElement > ) => {
										// Ignore clicks that originated on any button inside the card
										// (e.g. Accept/Dismiss handle their own actions).
										if ( ( e.target as HTMLElement ).closest( 'button' ) ) {
											return;
										}
										if ( clickable ) {
											focusBlock( edit.block_index );
										}
									};
									return (
										// The card cannot take `role="button"` because it already
										// contains the Accept/Dismiss buttons, and nested interactive
										// elements are invalid. Pointer users get the click-to-focus
										// enhancement; keyboard users operate the inner buttons
										// directly, so they are not blocked by the missing keyboard
										// handler on the card wrapper.
										// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
										<article
											className={ `jetpack-ai-review-mediation__card is-${ status }${
												clickable ? ' is-clickable' : ''
											}` }
											key={ `edit-${ i }` }
											onClick={ onCardClick }
										>
											<p className="jetpack-ai-review-mediation__block-ref">
												{ isPostWide
													? __( 'Post-wide', 'jetpack' )
													: `${ __( 'Block', 'jetpack' ) } ${ edit.block_index }` }
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
													{ edit.supported_by_reviewers.join( ', ' ) }
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
													onClick={ () => handleAccept( edit, i ) }
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
													onClick={ () => handleDismiss( i ) }
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
													<span className="jetpack-ai-review-mediation__block-ref">
														{ ' ' }
														({ __( 'block', 'jetpack' ) } { v.block_index })
													</span>
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
		</div>
	);
}
