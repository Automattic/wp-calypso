/**
 * ReviewCard — shared presentational card for post-review suggestions, used by
 * FeedbackList (Generate Feedback / Proofreader) and AI Editorial Review. Takes
 * a model, status, capability flags, and callbacks; each parent owns its own
 * apply/undo/dismiss/copy state.
 */

/**
 * External dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Icon, check, undo } from '@wordpress/icons';
import { type ReactNode } from 'react';
/**
 * Internal dependencies
 */
import BlockRef, { type BlockSnapshot } from './block-ref';

export type ReviewCardStatus = 'pending' | 'applying' | 'accepted' | 'dismissed' | 'failed';

/** One body row: a small tag plus its text, on the plain or highlighted band. */
export interface ReviewCardRow {
	tag: string;
	text: string;
	/** `new` renders on the highlighted band; `current` on the card surface. */
	variant: 'current' | 'new';
	/** Semantic element: an exact diff uses del/ins, advisory copy uses text. */
	element: 'del' | 'ins' | 'text';
	/** Server-sanitised HTML for display. When absent, `text` renders literally. */
	previewHtml?: string;
}

export interface ReviewCardModel {
	/** Category badge, e.g. `Spacing (1/1)`. Always the category — "Manual edit" is a separate tag. */
	badge: string;
	/** Advisory family: renders a "Manual edit" tag + advisory styling, no in-place Apply. */
	isManualEdit: boolean;
	/** 0-based target block index, or null for post-wide. */
	blockIndex: number | null;
	/** Card body: Why first, then the change (a Current/New diff, or a Suggestion). */
	bodyRows: ReviewCardRow[];
	/** Optional note explaining why this edit can't be one-click applied. */
	reasonNote?: string;
}

export interface ReviewCardProps {
	model: ReviewCardModel;
	blocks: BlockSnapshot[];
	status: ReviewCardStatus;
	/** Show the primary Apply/Retry button (else Go to section + Copy). */
	showApply: boolean;
	canGoToSection: boolean;
	showCopy: boolean;
	copied: boolean;
	/** Global gate: post stale or a bulk run is in flight. */
	disabled: boolean;
	/** Flow-specific message shown after a failed apply. */
	failureMessage: string;
	onApply: () => void;
	onGoToSection: () => void;
	onCopy: () => void;
	onDismiss: () => void;
	onUndo: () => void;
	/** Header block-ref click handler; omit to render the ref as a plain label. */
	onFocusBlock?: ( index: number ) => void;
	/** Optional content rendered under the actions (e.g. AER reviewer chips). */
	footer?: ReactNode;
	/** Root class prefix; defaults to the shared feedback-list styling. */
	classPrefix?: string;
}

interface ReviewCardApplyAction {
	label: string;
	onClick: () => void;
}

interface ReviewCardActionsProps {
	applyAction?: ReviewCardApplyAction;
	classPrefix?: string;
	disabled: boolean;
	onDismiss: () => void;
}

const DEFAULT_PREFIX = 'jetpack-ai-feedback-list';

function getApplyLabel( status: ReviewCardStatus ): string {
	switch ( status ) {
		case 'applying':
			return __( 'Applying…', __i18n_text_domain__ );
		case 'accepted':
			return __( 'Applied', __i18n_text_domain__ );
		case 'failed':
			return __( 'Retry', __i18n_text_domain__ );
		default:
			return __( 'Apply change', __i18n_text_domain__ );
	}
}

/** Shared action row for applicable review cards and conflict resolutions. */
export function ReviewCardActions( {
	applyAction,
	classPrefix = DEFAULT_PREFIX,
	disabled,
	onDismiss,
}: ReviewCardActionsProps ) {
	return (
		<div className={ `${ classPrefix }__actions` }>
			{ applyAction && (
				<button
					type="button"
					className={ `${ classPrefix }__action-button is-primary` }
					onClick={ applyAction.onClick }
					disabled={ disabled }
				>
					{ applyAction.label }
				</button>
			) }
			<button
				type="button"
				className={ `${ classPrefix }__action-button is-dismiss` }
				onClick={ onDismiss }
				disabled={ disabled }
			>
				{ __( 'Dismiss', __i18n_text_domain__ ) }
			</button>
		</div>
	);
}

/**
 * Render a single review suggestion card.
 * @param {ReviewCardProps} props Component props.
 * @returns React element.
 */
export default function ReviewCard( {
	model,
	blocks,
	status,
	showApply,
	canGoToSection,
	showCopy,
	copied,
	disabled,
	failureMessage,
	onApply,
	onGoToSection,
	onCopy,
	onDismiss,
	onUndo,
	onFocusBlock,
	footer,
	classPrefix = DEFAULT_PREFIX,
}: ReviewCardProps ) {
	const { badge, isManualEdit, blockIndex, bodyRows, reasonNote } = model;
	const isResolved = status === 'accepted' || status === 'dismissed';

	const header = (
		<div className={ `${ classPrefix }__item-header` }>
			<span className={ `${ classPrefix }__item-badge` }>{ badge }</span>
			<BlockRef
				index={ blockIndex }
				blocks={ blocks }
				onFocus={ onFocusBlock }
				className={ `${ classPrefix }__block-ref` }
			/>
		</div>
	);

	if ( isResolved ) {
		return (
			<div className={ `${ classPrefix }__item is-resolved is-${ status }` }>
				{ header }
				<div className={ `${ classPrefix }__actions` }>
					<span className={ `${ classPrefix }__resolution is-${ status }` }>
						{ status === 'accepted' && (
							<Icon className={ `${ classPrefix }__resolution-check` } icon={ check } size={ 20 } />
						) }
						{ status === 'accepted'
							? __( 'Applied', __i18n_text_domain__ )
							: __( 'Dismissed', __i18n_text_domain__ ) }
					</span>
					<button
						type="button"
						className={ `${ classPrefix }__action-button is-undo` }
						onClick={ onUndo }
						disabled={ disabled }
					>
						<Icon className={ `${ classPrefix }__undo-icon` } icon={ undo } size={ 20 } />
						{ __( 'Undo', __i18n_text_domain__ ) }
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			className={ `${ classPrefix }__item is-${ status } ${
				isManualEdit ? 'is-advisory' : 'is-applicable'
			}` }
		>
			{ isManualEdit && (
				<div className={ `${ classPrefix }__manual-tag` }>
					{ __( 'Manual edit', __i18n_text_domain__ ) }
				</div>
			) }
			{ header }
			{ bodyRows.length > 0 && (
				<div className={ `${ classPrefix }__diff` }>
					{ bodyRows.map( ( row, i ) => {
						let RowContentElement: 'del' | 'div' | 'ins' | 'span' =
							row.element === 'text' ? 'span' : row.element;
						if ( row.element === 'text' && typeof row.previewHtml === 'string' ) {
							RowContentElement = 'div';
						}
						const contentClassName = `${ classPrefix }__diff-content${
							row.element === 'text' ? ` ${ classPrefix }__diff-text` : ''
						}`;
						return (
							<div key={ i } className={ `${ classPrefix }__diff-row is-${ row.variant }` }>
								<span className={ `${ classPrefix }__diff-tag` }>{ row.tag }</span>
								{ typeof row.previewHtml === 'string' ? (
									<RichText.Content
										tagName={ RowContentElement }
										className={ contentClassName }
										value={ row.previewHtml }
									/>
								) : (
									<RowContentElement className={ contentClassName }>{ row.text }</RowContentElement>
								) }
							</div>
						);
					} ) }
				</div>
			) }
			{ reasonNote && <p className={ `${ classPrefix }__reason-note` }>{ reasonNote }</p> }
			{ showApply ? (
				<ReviewCardActions
					applyAction={ { label: getApplyLabel( status ), onClick: onApply } }
					classPrefix={ classPrefix }
					disabled={ disabled || status === 'applying' }
					onDismiss={ onDismiss }
				/>
			) : (
				<div className={ `${ classPrefix }__actions` }>
					<button
						type="button"
						className={ `${ classPrefix }__action-button is-primary` }
						onClick={ onGoToSection }
						disabled={ disabled || ! canGoToSection }
					>
						{ __( 'Go to section', __i18n_text_domain__ ) }
					</button>
					{ showCopy && (
						<button
							type="button"
							className={ `${ classPrefix }__action-button is-copy` }
							onClick={ onCopy }
							disabled={ disabled }
						>
							{ copied ? __( 'Copied', __i18n_text_domain__ ) : __( 'Copy', __i18n_text_domain__ ) }
						</button>
					) }

					<button
						type="button"
						className={ `${ classPrefix }__action-button is-dismiss` }
						onClick={ onDismiss }
						disabled={ disabled || status === 'applying' }
					>
						{ __( 'Dismiss', __i18n_text_domain__ ) }
					</button>
				</div>
			) }
			{ status === 'failed' && showApply && (
				<p className={ `${ classPrefix }__status is-failed` }>{ failureMessage }</p>
			) }
			{ footer && <div className={ `${ classPrefix }__footer-slot` }>{ footer }</div> }
		</div>
	);
}
