/**
 * ReviewMediation — renders the multi-reviewer mediation in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response via
 * 'big_sky__show_component' with data.type set to 'review-mediation'.
 *
 * Shows the summary, reviewer conflicts with recommended resolutions, cascade
 * implications, atomic suggested edits (accept/dismiss controls are local-only
 * in this iteration; applying to blocks is a follow-up), and a collapsible
 * list of guideline violations grounded in the site's content guidelines.
 */

/**
 * External dependencies
 */
import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

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
	onComplete?: () => void;
}

type EditStatus = 'pending' | 'accepted' | 'dismissed';

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
	const [ violationsOpen, setViolationsOpen ] = useState( false );

	const setStatus = useCallback( ( index: number, status: EditStatus ) => {
		setEditStatuses( ( prev ) => ( { ...prev, [ index ]: status } ) );
	}, [] );

	const hasNoReviewerInput =
		conflicts.length === 0 &&
		implications.length === 0 &&
		suggested_edits.length === 0 &&
		guideline_violations.length === 0;

	return (
		<div className="jetpack-ai-review-mediation">
			<section className="jetpack-ai-review-mediation__summary">
				<h3 className="jetpack-ai-review-mediation__heading">
					{ __( 'Review summary', 'jetpack' ) }
				</h3>
				<p>{ summary }</p>
			</section>

			{ hasNoReviewerInput ? null : (
				<>
					{ conflicts.length > 0 && (
						<section className="jetpack-ai-review-mediation__conflicts">
							<h3 className="jetpack-ai-review-mediation__heading">
								{ __( 'Conflicts', 'jetpack' ) }
							</h3>
							{ conflicts.map( ( conflict, i ) => (
								<article className="jetpack-ai-review-mediation__card" key={ `conflict-${ i }` }>
									<h4 className="jetpack-ai-review-mediation__card-title">{ conflict.subject }</h4>
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
						</section>
					) }

					{ implications.length > 0 && (
						<section className="jetpack-ai-review-mediation__implications">
							<h3 className="jetpack-ai-review-mediation__heading">
								{ __( 'Implications', 'jetpack' ) }
							</h3>
							<ul>
								{ implications.map( ( imp, i ) => (
									<li key={ `imp-${ i }` }>
										<strong>{ imp.change }</strong> — { imp.implies }
										{ imp.affected_blocks.length > 0 && (
											<span className="jetpack-ai-review-mediation__affected-blocks">
												{ ' ' }
												({ __( 'Affects blocks:', 'jetpack' ) } { imp.affected_blocks.join( ', ' ) }
												)
											</span>
										) }
									</li>
								) ) }
							</ul>
						</section>
					) }

					{ suggested_edits.length > 0 && (
						<section className="jetpack-ai-review-mediation__edits">
							<h3 className="jetpack-ai-review-mediation__heading">
								{ __( 'Suggested edits', 'jetpack' ) }
							</h3>
							{ suggested_edits.map( ( edit, i ) => {
								const status = editStatuses[ i ] ?? 'pending';
								return (
									<article
										className={ `jetpack-ai-review-mediation__card is-${ status }` }
										key={ `edit-${ i }` }
									>
										<p className="jetpack-ai-review-mediation__block-ref">
											{ edit.block_index !== null
												? `${ __( 'Block', 'jetpack' ) } ${ edit.block_index }`
												: __( 'Post-wide', 'jetpack' ) }
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
												disabled={ status !== 'pending' }
												onClick={ () => setStatus( i, 'accepted' ) }
											>
												{ status === 'accepted'
													? __( 'Accepted', 'jetpack' )
													: __( 'Accept', 'jetpack' ) }
											</button>
											<button
												type="button"
												className="jetpack-ai-review-mediation__action is-dismiss"
												disabled={ status !== 'pending' }
												onClick={ () => setStatus( i, 'dismissed' ) }
											>
												{ status === 'dismissed'
													? __( 'Dismissed', 'jetpack' )
													: __( 'Dismiss', 'jetpack' ) }
											</button>
										</div>
									</article>
								);
							} ) }
						</section>
					) }

					{ guideline_violations.length > 0 && (
						<section className="jetpack-ai-review-mediation__violations">
							<button
								type="button"
								className="jetpack-ai-review-mediation__violations-toggle"
								onClick={ () => setViolationsOpen( ( v ) => ! v ) }
								aria-expanded={ violationsOpen }
							>
								{ violationsOpen
									? __( 'Hide guideline violations', 'jetpack' )
									: __( 'Show guideline violations', 'jetpack' ) }{ ' ' }
								({ guideline_violations.length })
							</button>
							{ violationsOpen && (
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
							) }
						</section>
					) }
				</>
			) }
		</div>
	);
}
