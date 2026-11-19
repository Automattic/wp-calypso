import { store as blockEditorStore } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useRegistry, useSelect } from '@wordpress/data';
import { useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import { findQuote, locate, richTextOf, type Bindings, type ProofreadIssue } from './proofread';
import type { MutableRefObject } from 'react';

const KIND_LABEL = { spelling: 'Spelling', grammar: 'Grammar', style: 'Style', clarity: 'Clarity' };
// Underlined in red, and the others in blue.
const ERROR_KINDS = [ 'spelling', 'grammar' ];
const HIGHLIGHTS = [ 'mcp-proofread-error', 'mcp-proofread-style' ];
const CARD_WIDTH = 280;

const canHighlight = () => typeof Highlight !== 'undefined' && !! CSS.highlights;

function caretAt( x: number, y: number ) {
	if ( document.caretPositionFromPoint ) {
		const position = document.caretPositionFromPoint( x, y );
		return position && { node: position.offsetNode, offset: position.offset };
	}
	const range = document.caretRangeFromPoint?.( x, y );
	return range && { node: range.startContainer, offset: range.startOffset };
}

// Underlines each issue's quote in its block with the CSS Custom Highlight API, which leaves the
// content alone; a click on one opens a card to apply or dismiss it. Inside the editor's provider.
export function ProofreadLayer( {
	issues,
	onDone,
	onVisible,
	applyRef,
}: {
	issues: ProofreadIssue[];
	onDone: ( ids: string[], failed: number ) => void;
	onVisible: ( ids: string[] ) => void;
	// Apply all, from the bar outside the provider.
	applyRef: MutableRefObject< ( ( list: ProofreadIssue[] ) => void ) | undefined >;
} ) {
	const registry = useRegistry();
	// The blocks, so the underlines follow edits, and the selected block, which can re-render.
	const { blocks, selected } = useSelect( ( select ) => {
		const editor = select( blockEditorStore );
		return {
			blocks: editor.getBlocks(),
			selected: editor.getSelectedBlockClientId(),
		};
	}, [] );
	const found = useRef< { issue: ProofreadIssue; range: Range }[] >( [] );
	const bindings = useRef< Bindings >( new Map() );
	// Below the text, or above it (`above` is the text's top) when it would overflow the panel.
	const [ card, setCard ] = useState< { id: string; top: number; above: number; left: number } >();
	const cardRef = useRef< HTMLDivElement >( null );
	const onVisibleRef = useRef( onVisible );
	onVisibleRef.current = onVisible;

	useEffect( () => {
		const frame = requestAnimationFrame( () => {
			// Only issues Apply can change, underlined where it would. The store's blocks, as the
			// render's can be from before a merge that came with the issues.
			const current = registry.select( blockEditorStore ).getBlocks();
			found.current = issues.flatMap( ( issue ) => {
				const target = locate( bindings.current, current, issue );
				const element = target && richTextOf( target );
				const range = element ? findQuote( element, issue.quote ) : null;
				return range ? [ { issue, range } ] : [];
			} );
			if ( canHighlight() ) {
				const ranges = ( errors: boolean ) =>
					found.current
						.filter( ( { issue } ) => ERROR_KINDS.includes( issue.kind ) === errors )
						.map( ( { range } ) => range );
				CSS.highlights.set( HIGHLIGHTS[ 0 ], new Highlight( ...ranges( true ) ) );
				CSS.highlights.set( HIGHLIGHTS[ 1 ], new Highlight( ...ranges( false ) ) );
			}
			onVisibleRef.current( found.current.map( ( { issue } ) => issue.id ) );
		} );
		return () => cancelAnimationFrame( frame );
	}, [ registry, issues, blocks, selected ] );

	useEffect(
		() => () => {
			if ( canHighlight() ) {
				HIGHLIGHTS.forEach( ( name ) => CSS.highlights.delete( name ) );
			}
		},
		[]
	);

	// Opens the card for the underlined text under a click. A text selection gets Ask instead.
	useEffect( () => {
		const onClick = ( event: MouseEvent ) => {
			const target = event.target instanceof Element ? event.target : null;
			if ( target?.closest( '.mcp-post-editor__fix' ) ) {
				return;
			}
			const point =
				target?.closest( '.editor-styles-wrapper' ) &&
				document.getSelection()?.isCollapsed &&
				caretAt( event.clientX, event.clientY );
			const hit =
				point &&
				found.current.find( ( { range } ) => range.isPointInRange( point.node, point.offset ) );
			if ( ! hit ) {
				setCard( undefined );
				return;
			}
			const rect = hit.range.getBoundingClientRect();
			setCard( {
				id: hit.issue.id,
				top: rect.bottom + 6,
				above: rect.top - 6,
				left: Math.max( 8, Math.min( rect.left, window.innerWidth - CARD_WIDTH - 8 ) ),
			} );
		};
		// The card is placed for where the text was.
		const onScroll = () => setCard( undefined );
		document.addEventListener( 'click', onClick );
		document.addEventListener( 'scroll', onScroll, true );
		return () => {
			document.removeEventListener( 'click', onClick );
			document.removeEventListener( 'scroll', onScroll, true );
		};
	}, [] );

	// Flips the card above the text when it would overflow the panel's bottom.
	useLayoutEffect( () => {
		const element = cardRef.current;
		if ( ! card || ! element ) {
			return;
		}
		const panel = element.closest( '.mcp-post-editor' )?.getBoundingClientRect().bottom;
		const bottom = Math.min( window.innerHeight, panel ?? window.innerHeight ) - 8;
		const height = element.offsetHeight;
		element.style.top = `${
			card.top + height > bottom && card.above - height >= 8 ? card.above - height : card.top
		}px`;
	}, [ card ] );

	// Replaces each quote where it's underlined, through the store, so it reaches the page's
	// onChange and its update like typing.
	function apply( list: ProofreadIssue[] ) {
		const { updateBlockAttributes } = registry.dispatch( blockEditorStore );
		const applied = list.filter( ( issue ) => {
			const target = locate(
				bindings.current,
				registry.select( blockEditorStore ).getBlocks(),
				issue
			);
			if ( target ) {
				updateBlockAttributes( target.clientId, { [ target.key ]: target.next } );
			}
			return !! target;
		} );
		setCard( undefined );
		onDone(
			applied.map( ( issue ) => issue.id ),
			list.length - applied.length
		);
	}
	applyRef.current = apply;

	const issue = card && issues.find( ( item ) => item.id === card.id );
	if ( ! card || ! issue ) {
		return null;
	}
	return (
		<div
			ref={ cardRef }
			className="mcp-post-editor__fix"
			role="dialog"
			aria-label="Proofreading"
			style={ { top: card.top, left: card.left, width: CARD_WIDTH } }
		>
			<p>
				<b>{ KIND_LABEL[ issue.kind ] ?? issue.kind }:</b> “{ issue.quote }” →{ ' ' }
				{ issue.replacement ? <b>“{ issue.replacement }”</b> : <b>remove</b> }
			</p>
			<p className="mcp-post-editor__fix-reason">{ issue.reason }</p>
			<div className="mcp-post-editor__fix-actions">
				<Button
					size="compact"
					variant="tertiary"
					onClick={ () => {
						setCard( undefined );
						onDone( [ issue.id ], 0 );
					} }
				>
					Dismiss
				</Button>
				<Button size="compact" variant="primary" onClick={ () => apply( [ issue ] ) }>
					Apply
				</Button>
			</div>
		</div>
	);
}
