import { Button, Panel, PanelBody, Path, SVG } from '@wordpress/components';
import { useLayoutEffect, useRef } from '@wordpress/element';
import { isSummaryOnly } from './proofread';
import { KIND_LABEL, type BlockPositions, type FixKind } from './proofread-layer';
import type {
	Feedback,
	FeedbackItem,
	Fix,
	FixStatus,
	FixStatuses,
	ProofreadIssue,
} from './proofread';

type Props = {
	// The proofreading issues to show: the open ones the canvas still has, and those resolved here.
	issues: ProofreadIssue[];
	feedback: Feedback | null;
	// The issues and items the user applied or dismissed, which can be undone.
	status: FixStatuses;
	// Where each issue's and item's block is now, by `kind:id`.
	positions: BlockPositions;
	onApply: ( kind: FixKind, list: Fix[] ) => void;
	onDismiss: ( kind: FixKind, id: string ) => void;
	onUndo: ( kind: FixKind, fix: Fix ) => void;
	onShow: ( fix: Fix, kind: FixKind ) => void;
};

// What a card shows, for a proofreading issue or a feedback item.
type Card = { fix: Fix; title: string; why: string; isManual: boolean };
const issueCard = ( issue: ProofreadIssue ): Card => ( {
	fix: issue,
	title: KIND_LABEL[ issue.kind ] ?? issue.kind,
	why: issue.reason,
	isManual: false,
} );
const feedbackCard = ( item: FeedbackItem ): Card => ( {
	fix: item,
	title: item.title,
	why: item.feedback,
	isManual: item.requires_manual,
} );

// The block an item is about: a chip that scrolls to it, or "Post-wide".
function BlockChip( { index, onShow }: { index: number | null; onShow: () => void } ) {
	if ( index === null ) {
		return <span className="mcp-post-editor__block-ref is-post-wide">Post-wide</span>;
	}
	return (
		<button
			type="button"
			className="mcp-post-editor__block-ref"
			title="Scroll to the block"
			onClick={ onShow }
		>
			Block { index }
		</button>
	);
}

// One issue or item, as WP Agent's review card: the why, and the change to apply, or a manual edit
// to make. Applied and dismissed cards keep their header, with Undo.
function ReviewCard( {
	card: { fix, title, why, isManual },
	status,
	onApply,
	onDismiss,
	onUndo,
	onShow,
	block,
}: {
	card: Card;
	status?: FixStatus;
	block: number | null;
	onApply: () => void;
	onDismiss: () => void;
	onUndo: () => void;
	onShow: () => void;
} ) {
	const header = (
		<div className="mcp-post-editor__card-header">
			<span className="mcp-post-editor__card-title">{ title }</span>
			<BlockChip index={ block } onShow={ onShow } />
		</div>
	);
	if ( status ) {
		return (
			<li className={ `mcp-post-editor__card is-${ status }` } data-id={ fix.id }>
				{ header }
				<div className="mcp-post-editor__card-actions">
					<span className={ `mcp-post-editor__resolution is-${ status }` }>
						<span className="mcp-post-editor__resolution-icon" aria-hidden="true">
							{ status === 'applied' ? '✓' : '✕' }
						</span>
						{ status === 'applied' ? 'Applied' : 'Dismissed' }
					</span>
					<Button size="compact" variant="tertiary" onClick={ onUndo }>
						Undo
					</Button>
				</div>
			</li>
		);
	}
	return (
		<li className={ `mcp-post-editor__card${ isManual ? ' is-manual' : '' }` } data-id={ fix.id }>
			{ isManual && <span className="mcp-post-editor__manual-tag">Manual edit</span> }
			{ header }
			{ why && (
				<div className="mcp-post-editor__card-row">
					<span className="mcp-post-editor__card-tag">Why</span>
					<span>{ why }</span>
				</div>
			) }
			{ ! isManual && (
				<>
					<div className="mcp-post-editor__card-row">
						<span className="mcp-post-editor__card-tag">Current</span>
						<del>{ fix.quote }</del>
					</div>
					<div className="mcp-post-editor__card-row is-new">
						<span className="mcp-post-editor__card-tag">New</span>
						{ fix.replacement ? <ins>{ fix.replacement }</ins> : <em>Remove</em> }
					</div>
				</>
			) }
			<div className="mcp-post-editor__card-actions">
				{ ! isManual && (
					<Button size="compact" variant="primary" onClick={ onApply }>
						Apply change
					</Button>
				) }
				{ isManual && fix.block_index !== null && (
					<Button size="compact" variant="primary" onClick={ onShow }>
						Go to section
					</Button>
				) }
				<Button
					className="mcp-post-editor__card-dismiss"
					size="compact"
					variant="tertiary"
					onClick={ onDismiss }
				>
					Dismiss
				</Button>
			</div>
		</li>
	);
}

// @wordpress/icons' `check`, which the app doesn't depend on.
const CHECK = (
	<SVG
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
	>
		<Path d="M7 12L10 15L17 8" />
	</SVG>
);

// The review panel over the dock's pill: the proofreading issues and the editorial feedback, as
// cards, each section collapsible with its own Apply all.
export function ReviewPanel( {
	issues,
	feedback,
	status,
	positions,
	onApply,
	onDismiss,
	onUndo,
	onShow,
}: Props ) {
	const items = feedback?.items ?? [];
	const openIssues = issues.filter( ( issue ) => ! status.proofread[ issue.id ] );
	const openItems = items.filter( ( item ) => ! status.feedback[ item.id ] );
	const applicable = openItems.filter( ( item ) => ! item.requires_manual );

	// A card's buttons change with its status: once it has, the focus goes to the card's first
	// action, Undo or the one it had before. After Apply all, to the section's first card still
	// open, or its heading. Unarmed if the status doesn't change, as when Apply couldn't apply.
	const panelRef = useRef< HTMLElement >( null );
	const focusCard = useRef< { kind: FixKind; id: string; resolved: boolean; next: boolean } >(
		undefined
	);
	useLayoutEffect( () => {
		const after = focusCard.current;
		if ( ! after || !! status[ after.kind ][ after.id ] !== after.resolved ) {
			return;
		}
		focusCard.current = undefined;
		const list = panelRef.current?.querySelector( `[data-kind="${ after.kind }"]` );
		const card = after.next
			? list?.querySelector( '.mcp-post-editor__card:not(.is-applied):not(.is-dismissed)' )
			: list?.querySelector( `[data-id="${ CSS.escape( after.id ) }"]` );
		(
			card?.querySelector< HTMLElement >( '.mcp-post-editor__card-actions button' ) ??
			list
				?.closest( '.components-panel__body' )
				?.querySelector< HTMLElement >( '.components-panel__body-toggle' )
		)?.focus();
	} );
	// A focused card can go while the panel stays, as when an undone issue's quote is gone from the
	// canvas: the focus goes to its section's heading, or the panel when the section went too.
	const focused = useRef< { kind: string; id: string } >( undefined );
	useLayoutEffect( () => {
		const panel = panelRef.current;
		const last = focused.current;
		if ( ! panel || ! last || panel.contains( panel.ownerDocument.activeElement ) ) {
			return;
		}
		const active = panel.ownerDocument.activeElement;
		focused.current = undefined;
		const list = panel.querySelector( `[data-kind="${ last.kind }"]` );
		if (
			( active && active !== panel.ownerDocument.body ) ||
			list?.querySelector( `[data-id="${ CSS.escape( last.id ) }"]` )
		) {
			return;
		}
		(
			list
				?.closest( '.components-panel__body' )
				?.querySelector< HTMLElement >( '.components-panel__body-toggle' ) ?? panel
		).focus();
	} );
	// The panel goes with its last card: the focus goes to the canvas, if it was in the panel.
	useLayoutEffect( () => {
		const panel = panelRef.current;
		return () => {
			if ( panel?.contains( panel.ownerDocument.activeElement ) ) {
				panel.ownerDocument.querySelector< HTMLElement >( '.editor-styles-wrapper' )?.focus();
			}
		};
	}, [] );
	const finishCard = ( kind: FixKind, id: string, finish: () => void, next = false ) => {
		focusCard.current = { kind, id, resolved: ! status[ kind ][ id ], next };
		finish();
		setTimeout( () => {
			if ( focusCard.current?.id === id ) {
				focusCard.current = undefined;
			}
		} );
	};

	const applyAll = ( kind: FixKind, list: Fix[] ) =>
		list.length > 0 && (
			<div className="mcp-post-editor__review-all">
				<Button
					size="small"
					variant="secondary"
					onClick={ () => finishCard( kind, list[ 0 ].id, () => onApply( kind, list ), true ) }
				>
					Apply all
				</Button>
			</div>
		);
	const cards = ( kind: FixKind, list: Card[] ) => (
		<ul className="mcp-post-editor__cards" data-kind={ kind }>
			{ list.map( ( card ) => {
				const { fix } = card;
				return (
					<ReviewCard
						key={ fix.id }
						card={ card }
						status={ status[ kind ][ fix.id ] }
						block={ positions[ `${ kind }:${ fix.id }` ] ?? fix.block_index }
						onApply={ () => finishCard( kind, fix.id, () => onApply( kind, [ fix ] ) ) }
						onDismiss={ () => finishCard( kind, fix.id, () => onDismiss( kind, fix.id ) ) }
						onUndo={ () => finishCard( kind, fix.id, () => onUndo( kind, fix ) ) }
						onShow={ () => onShow( fix, kind ) }
					/>
				);
			} ) }
		</ul>
	);

	return (
		<section
			ref={ panelRef }
			className="mcp-post-editor__review"
			aria-label="Review"
			tabIndex={ -1 }
			onFocus={ ( event ) => {
				const card = event.target.closest< HTMLElement >( '[data-id]' );
				const kind = card?.closest< HTMLElement >( '[data-kind]' )?.dataset.kind;
				focused.current = card?.dataset.id && kind ? { kind, id: card.dataset.id } : undefined;
			} }
		>
			<Panel>
				{ issues.length > 0 && (
					<PanelBody title={ `Proofread (${ openIssues.length })` } initialOpen>
						{ applyAll( 'proofread', openIssues ) }
						{ cards( 'proofread', issues.map( issueCard ) ) }
					</PanelBody>
				) }
				{ items.length > 0 && (
					<PanelBody title={ `Editorial (${ openItems.length })` } initialOpen>
						{ feedback?.summary && (
							<p className="mcp-post-editor__review-summary">{ feedback.summary }</p>
						) }
						{ applyAll( 'feedback', applicable ) }
						{ cards( 'feedback', items.map( feedbackCard ) ) }
					</PanelBody>
				) }
				{ feedback && isSummaryOnly( feedback ) && (
					<PanelBody title="Editorial" initialOpen>
						<div className="mcp-post-editor__review-done">
							{ CHECK }
							<div>
								<b>No changes suggested</b>
								<p>{ feedback.summary }</p>
							</div>
						</div>
					</PanelBody>
				) }
			</Panel>
		</section>
	);
}
