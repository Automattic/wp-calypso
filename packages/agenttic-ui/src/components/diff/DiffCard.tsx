import { __ } from '@wordpress/i18n';
import { type ReactNode } from 'react';
import { cn } from '../../utils/classNames';
import styles from './DiffCard.module.css';

/**
 * A single before/after change within a diff.
 *
 * This is a generic, presentational shape — `original` is the prior content
 * and `replacement` is the proposed content. Either may be omitted (a pure
 * addition has no `original`; a pure removal has no `replacement`).
 */
export interface DiffCardChange {
	original?: string;
	replacement?: string;
	label?: string;
}

/**
 * Diff content the card knows how to render.
 *
 * - A plain `string` is shown verbatim in a monospace block.
 * - A `DiffCardChange` (or array of them) is rendered as before/after blocks.
 */
export type DiffCardContent = string | DiffCardChange | DiffCardChange[];

export type DiffDecision = 'accepted' | 'rejected';

export interface DiffCardProps {
	diff: DiffCardContent;
	title?: string;
	summary?: string;
	onResolve: ( decision: DiffDecision ) => void | Promise< void >;
	disabled?: boolean;
	resolved?: DiffDecision;
	acceptLabel?: string;
	rejectLabel?: string;
	className?: string;
	/**
	 * Render custom diff body content. When provided it replaces the built-in
	 * string / change rendering, letting consumers visualize structured diffs
	 * however they like while keeping the themed card chrome and controls.
	 */
	renderDiff?: ( diff: DiffCardContent ) => ReactNode;
}

function toChanges( diff: DiffCardContent ): DiffCardChange[] {
	if ( typeof diff === 'string' ) {
		return [];
	}
	return Array.isArray( diff ) ? diff : [ diff ];
}

function renderChange( change: DiffCardChange, index: number ): ReactNode {
	const hasOriginal =
		typeof change.original === 'string' && change.original.length > 0;
	const hasReplacement =
		typeof change.replacement === 'string' && change.replacement.length > 0;

	return (
		<div key={ index } className={ styles.change } data-slot="change">
			{ change.label ? (
				<span className={ styles.changeLabel } data-slot="change-label">
					{ change.label }
				</span>
			) : null }
			{ hasOriginal ? (
				<pre
					className={ cn( styles.diff, styles.removed ) }
					data-slot="original"
				>
					{ change.original }
				</pre>
			) : null }
			{ hasReplacement ? (
				<pre
					className={ cn( styles.diff, styles.added ) }
					data-slot="replacement"
				>
					{ change.replacement }
				</pre>
			) : null }
		</div>
	);
}

export function DiffCard( {
	diff,
	title,
	summary,
	onResolve,
	disabled = false,
	resolved,
	acceptLabel,
	rejectLabel,
	className,
	renderDiff,
}: DiffCardProps ) {
	const isResolved = !! resolved;
	const controlsDisabled = disabled || isResolved;
	const changes = toChanges( diff );

	let body: ReactNode;
	if ( renderDiff ) {
		body = renderDiff( diff );
	} else if ( typeof diff === 'string' ) {
		body = (
			<pre className={ styles.diff } data-slot="diff">
				{ diff }
			</pre>
		);
	} else {
		body = changes.map( renderChange );
	}

	return (
		<section
			className={ cn(
				styles.card,
				isResolved ? styles.isResolved : undefined,
				className
			) }
			data-agenttic-diff-card
			data-slot="card"
		>
			{ title ? (
				<p className={ styles.title } data-slot="title">
					{ title }
				</p>
			) : null }
			{ summary ? (
				<p className={ styles.summary } data-slot="summary">
					{ summary }
				</p>
			) : null }
			<div className={ styles.body } data-slot="body">
				{ body }
			</div>
			{ isResolved ? (
				<p className={ styles.resolution } data-slot="resolution">
					{ resolved === 'accepted'
						? __( 'Accepted', 'a8c-agenttic' )
						: __( 'Rejected', 'a8c-agenttic' ) }
				</p>
			) : (
				<div className={ styles.actions } data-slot="actions">
					<button
						type="button"
						data-slot="accept"
						className={ cn( styles.action, styles.accept ) }
						disabled={ controlsDisabled }
						onClick={ () => onResolve( 'accepted' ) }
					>
						{ acceptLabel ?? __( 'Accept', 'a8c-agenttic' ) }
					</button>
					<button
						type="button"
						data-slot="reject"
						className={ cn( styles.action, styles.reject ) }
						disabled={ controlsDisabled }
						onClick={ () => onResolve( 'rejected' ) }
					>
						{ rejectLabel ?? __( 'Reject', 'a8c-agenttic' ) }
					</button>
				</div>
			) }
		</section>
	);
}
