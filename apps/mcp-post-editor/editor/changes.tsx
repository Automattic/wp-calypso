import { store as blockEditorStore } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { diffWords, textOf } from './diff';

// A pending change the assistant made, from `wpcom-post-editor-state`. `block_index` starts at 1;
// null is the title, whose `before` and `after` are plain text.
export type AgentChange = {
	change_id: string;
	block_index: number | null;
	before: string;
	after: string;
};

export type Decision = 'accept' | 'reject' | 'undo';

export const changeLabel = ( change: Pick< AgentChange, 'block_index' > ) =>
	change.block_index === null ? 'the title' : `block ${ change.block_index }`;

// Unchanged text keeps a few words of context next to each change.
const CONTEXT_WORDS = 6;
function shorten( text: string, isFirst: boolean, isLast: boolean ) {
	const words = text.trim().split( ' ' );
	if ( words.length <= CONTEXT_WORDS * 2 ) {
		return text;
	}
	const head = isFirst ? '' : `${ words.slice( 0, CONTEXT_WORDS ).join( ' ' ) } `;
	const tail = isLast ? '' : ` ${ words.slice( -CONTEXT_WORDS ).join( ' ' ) } `;
	return `${ head }…${ tail }`;
}

function ChangeCard( {
	change,
	onDecide,
}: {
	change: AgentChange;
	onDecide: ( decision: Decision, ids: string[] ) => void;
} ) {
	const parts = useMemo( () => {
		const isTitle = change.block_index === null;
		return diffWords(
			isTitle ? change.before : textOf( change.before ),
			isTitle ? change.after : textOf( change.after )
		);
	}, [ change ] );
	const label = changeLabel( change );
	return (
		<li className="mcp-post-editor__change">
			<p className="mcp-post-editor__change-label">
				{ label.charAt( 0 ).toUpperCase() + label.slice( 1 ) }
			</p>
			<p className="mcp-post-editor__diff">
				{ parts.every( ( part ) => part.type === 'same' ) && (
					<em>Only the formatting or media changed.</em>
				) }
				{ parts.some( ( part ) => part.type !== 'same' ) &&
					parts.map( ( part, i ) => {
						const text = i < parts.length - 1 ? `${ part.text } ` : part.text;
						if ( part.type === 'removed' ) {
							return <del key={ i }>{ text }</del>;
						}
						if ( part.type === 'added' ) {
							return <ins key={ i }>{ text }</ins>;
						}
						return <span key={ i }>{ shorten( text, i === 0, i === parts.length - 1 ) }</span>;
					} ) }
			</p>
			<div className="mcp-post-editor__change-actions">
				<Button
					size="compact"
					variant="primary"
					onClick={ () => onDecide( 'accept', [ change.change_id ] ) }
				>
					Accept
				</Button>
				<Button
					size="compact"
					variant="secondary"
					onClick={ () => onDecide( 'reject', [ change.change_id ] ) }
				>
					Reject
				</Button>
			</div>
		</li>
	);
}

// The assistant's pending changes, under the bar, and an Undo for the last accepted ones.
export function AgentChanges( {
	changes,
	accepted,
	onDecide,
}: {
	changes: AgentChange[];
	accepted?: { ids: string[]; label: string };
	onDecide: ( decision: Decision, ids: string[] ) => void;
} ) {
	if ( ! changes.length && ! accepted ) {
		return null;
	}
	const ids = changes.map( ( change ) => change.change_id );
	return (
		<section className="mcp-post-editor__changes" aria-label="The assistant’s changes">
			{ accepted && (
				<p className="mcp-post-editor__accepted">
					Accepted { accepted.label }.
					<Button size="compact" variant="link" onClick={ () => onDecide( 'undo', accepted.ids ) }>
						Undo
					</Button>
				</p>
			) }
			{ changes.length > 1 && (
				<div className="mcp-post-editor__change-actions">
					<Button size="compact" variant="secondary" onClick={ () => onDecide( 'accept', ids ) }>
						Accept all
					</Button>
					<Button size="compact" variant="secondary" onClick={ () => onDecide( 'reject', ids ) }>
						Reject all
					</Button>
				</div>
			) }
			{ changes.length > 0 && (
				<ul>
					{ changes.map( ( change ) => (
						<ChangeCard key={ change.change_id } change={ change } onDecide={ onDecide } />
					) ) }
				</ul>
			) }
		</section>
	);
}

// Outlines the top-level blocks the assistant changed. Inside the editor's provider.
export function ChangedBlocks( { indexes }: { indexes: number[] } ) {
	const order = useSelect( ( select ) => select( blockEditorStore ).getBlockOrder(), [] );
	const selector = indexes
		.map( ( index ) => order[ index - 1 ] )
		.filter( Boolean )
		.map( ( clientId ) => `.editor-styles-wrapper [data-block="${ clientId }"]` )
		.join( ', ' );
	return selector ? (
		<style>{ `${ selector } { outline: 2px solid #3858e9; outline-offset: 4px; }` }</style>
	) : null;
}
