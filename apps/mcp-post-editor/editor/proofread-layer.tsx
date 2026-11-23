import { store as blockEditorStore } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { useRegistry, useSelect } from '@wordpress/data';
import { useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
import {
	boundBlock,
	findQuote,
	htmlOf,
	locate,
	richTextOf,
	undoValue,
	type Bindings,
	type Fix,
	type FixKind,
	type FixStatus,
	type ProofreadIssue,
	type Target,
} from './proofread';
import type { MutableRefObject } from 'react';

export const KIND_LABEL: Record< string, string > = {
	spelling: 'Spelling',
	grammar: 'Grammar',
	style: 'Style',
	clarity: 'Clarity',
};
// Underlined in red, and the others in blue.
const ERROR_KINDS = [ 'spelling', 'grammar' ];
const HIGHLIGHTS = [ 'mcp-proofread-error', 'mcp-proofread-style' ];
const CARD_WIDTH = 280;
// How long a block stays outlined after its chip scrolls to it.
const FLASH_TIME = 1500;

export type { FixKind };
export type BlockPositions = Record< string, number >;

const canHighlight = () => typeof Highlight !== 'undefined' && !! CSS.highlights;

function caretAt( x: number, y: number ) {
	if ( document.caretPositionFromPoint ) {
		const position = document.caretPositionFromPoint( x, y );
		return position && { node: position.offsetNode, offset: position.offset };
	}
	const range = document.caretRangeFromPoint?.( x, y );
	return range && { node: range.startContainer, offset: range.startOffset };
}

// Below the text, or above it (`above` is the text's top) when it would overflow the panel.
function cardAt( { issue, range }: { issue: ProofreadIssue; range: Range } ) {
	const rect = range.getBoundingClientRect();
	return {
		id: issue.id,
		top: rect.bottom + 6,
		above: rect.top - 6,
		left: Math.max( 8, Math.min( rect.left, window.innerWidth - CARD_WIDTH - 8 ) ),
	};
}

// Scrolls the canvas to put the top of `rect` in its middle. Only the canvas scrolls:
// scrollIntoView would scroll the host's page too.
function scrollCanvasTo( rect: DOMRect ) {
	const canvas = document.querySelector( '.mcp-post-editor__canvas' );
	if ( canvas ) {
		const box = canvas.getBoundingClientRect();
		canvas.scrollTop += rect.top - box.top - box.height / 2;
	}
}

// Underlines each issue's quote in its block with the CSS Custom Highlight API, which leaves the
// content alone; a click on one opens a card to apply or dismiss it. Inside the editor's provider.
export function ProofreadLayer( {
	issues,
	fixes,
	onDone,
	onVisible,
	onBlocks,
	applyRef,
	showRef,
	undoRef,
}: {
	// The open issues, underlined.
	issues: ProofreadIssue[];
	// Every issue and feedback item, open or not, bound to their blocks as they arrive.
	fixes: Record< FixKind, Fix[] >;
	onDone: ( kind: FixKind, ids: string[], status: FixStatus, failed: number ) => void;
	onVisible: ( ids: string[] ) => void;
	// Where each issue's and item's block is now, from 1, by `kind:id`; missing when it's gone.
	onBlocks: ( positions: BlockPositions ) => void;
	// Apply and Apply all, from the review panel outside the provider.
	applyRef: MutableRefObject< ( ( list: Fix[], kind?: FixKind ) => void ) | undefined >;
	// Scrolls to a fix's block and outlines it for a moment.
	showRef: MutableRefObject< ( ( fix: Fix, kind: FixKind ) => void ) | undefined >;
	// Puts back the text an applied issue or item replaced, unless it changed since; true if it did.
	undoRef: MutableRefObject< ( ( kind: FixKind, id: string ) => boolean ) | undefined >;
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
	// By kind: a proofreading issue and a feedback item can share an id.
	const bindings = useRef< Record< FixKind, Bindings > >( {
		proofread: new Map(),
		feedback: new Map(),
	} );
	// Each applied fix's target and the value it replaced, for Undo, by kind.
	const undos = useRef< Record< FixKind, Map< string, Target & { before: unknown } > > >( {
		proofread: new Map(),
		feedback: new Map(),
	} );
	const [ flash, setFlash ] = useState< string >();
	const [ card, setCard ] = useState< { id: string; top: number; above: number; left: number } >();
	const cardRef = useRef< HTMLDivElement >( null );
	const onVisibleRef = useRef( onVisible );
	onVisibleRef.current = onVisible;
	const onBlocksRef = useRef( onBlocks );
	onBlocksRef.current = onBlocks;

	useEffect( () => {
		const frame = requestAnimationFrame( () => {
			// Only issues Apply can change, underlined where it would. The store's blocks, as the
			// render's can be from before a merge that came with the issues.
			const current = registry.select( blockEditorStore ).getBlocks();
			found.current = issues.flatMap( ( issue ) => {
				const target = locate( bindings.current.proofread, current, issue, 'proofread' );
				const element = target && richTextOf( target );
				const range = element ? findQuote( element, issue.quote ) : null;
				return range ? [ { issue, range } ] : [];
			} );
			// Feedback items bind now too, so edits before a click don't move them.
			const positions: BlockPositions = {};
			const position = ( kind: FixKind, fix: Fix ) => {
				const block = boundBlock( bindings.current[ kind ], current, fix, kind );
				if ( block ) {
					positions[ `${ kind }:${ fix.id }` ] = current.indexOf( block ) + 1;
				}
			};
			( Object.keys( fixes ) as FixKind[] ).forEach( ( kind ) => {
				fixes[ kind ].forEach( ( fix ) => position( kind, fix ) );
				// A new run's fixes have new ids: the last one's bindings and undos go.
				const ids = new Set( fixes[ kind ].map( ( fix ) => fix.id ) );
				[ bindings.current[ kind ], undos.current[ kind ] ].forEach( ( map ) =>
					map.forEach( ( _, id ) => ids.has( id ) || map.delete( id ) )
				);
			} );
			onBlocksRef.current( positions );
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
	}, [ registry, issues, fixes, blocks, selected ] );

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
			setCard( hit ? cardAt( hit ) : undefined );
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

	showRef.current = ( fix, kind ) => {
		const block = boundBlock(
			bindings.current[ kind ],
			registry.select( blockEditorStore ).getBlocks(),
			fix,
			kind
		);
		const element =
			block &&
			document.querySelector(
				`.editor-styles-wrapper [data-block="${ CSS.escape( block.clientId ) }"]`
			);
		if ( ! block || ! element ) {
			return;
		}
		scrollCanvasTo( element.getBoundingClientRect() );
		setFlash( block.clientId );
	};

	useEffect( () => {
		if ( ! flash ) {
			return;
		}
		const timeout = setTimeout( () => setFlash( undefined ), FLASH_TIME );
		return () => clearTimeout( timeout );
	}, [ flash ] );

	// Flips the card above the text when it would overflow the panel's bottom or reach the dock.
	useLayoutEffect( () => {
		const element = cardRef.current;
		if ( ! card || ! element ) {
			return;
		}
		const panel = element.closest( '.mcp-post-editor' )?.getBoundingClientRect().bottom;
		// Above the dock's pill and the issues list too.
		const dock = document.querySelector( '.mcp-post-editor__dock' )?.getBoundingClientRect();
		const bottom =
			Math.min(
				window.innerHeight,
				panel ?? window.innerHeight,
				dock?.height ? dock.top : Infinity
			) - 8;
		const height = element.offsetHeight;
		element.style.top = `${
			card.top + height > bottom && card.above - height >= 8 ? card.above - height : card.top
		}px`;
	}, [ card ] );

	// Replaces each quote where it's underlined, through the store, so it reaches the page's
	// onChange and its update like typing.
	function apply( list: Fix[], kind: FixKind = 'proofread' ) {
		const editor = registry.select( blockEditorStore );
		const { updateBlockAttributes } = registry.dispatch( blockEditorStore );
		const applied = list.filter( ( issue ) => {
			const target = locate( bindings.current[ kind ], editor.getBlocks(), issue, kind );
			if ( target ) {
				const before = editor.getBlockAttributes( target.clientId )?.[ target.key ];
				undos.current[ kind ].set( issue.id, { ...target, before } );
				updateBlockAttributes( target.clientId, { [ target.key ]: target.next } );
			}
			return !! target;
		} );
		setCard( undefined );
		onDone(
			kind,
			applied.map( ( issue ) => issue.id ),
			'applied',
			list.length - applied.length
		);
	}
	applyRef.current = apply;

	// Puts back the value Apply replaced when the text is as Apply left it, or else takes back only
	// Apply's change where the text around it is still as Apply left it, as after another Apply in
	// the same block. Never anything else in the text. Already undone, as by the editor's own undo,
	// it changes nothing.
	undoRef.current = ( kind, id ) => {
		const undo = undos.current[ kind ].get( id );
		const html =
			undo &&
			htmlOf(
				registry.select( blockEditorStore ).getBlockAttributes( undo.clientId )?.[ undo.key ]
			);
		if ( ! undo || typeof html !== 'string' ) {
			return false;
		}
		const value = undoValue( html, undo );
		if ( value === null ) {
			return false;
		}
		undos.current[ kind ].delete( id );
		if ( value !== undefined ) {
			registry.dispatch( blockEditorStore ).updateBlockAttributes( undo.clientId, {
				[ undo.key ]: value,
			} );
		}
		return true;
	};

	// Outlines the block a chip scrolled to.
	const flashStyle = flash && (
		<style>{ `.editor-styles-wrapper [data-block="${ flash }"] { outline: 2px solid var(--mcp-post-editor-flash); outline-offset: 4px; }` }</style>
	);

	const issue = card && issues.find( ( item ) => item.id === card.id );
	if ( ! card || ! issue ) {
		return flashStyle || null;
	}
	return (
		<>
			{ flashStyle }
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
							onDone( 'proofread', [ issue.id ], 'dismissed', 0 );
						} }
					>
						Dismiss
					</Button>
					<Button size="compact" variant="primary" onClick={ () => apply( [ issue ] ) }>
						Apply
					</Button>
				</div>
			</div>
		</>
	);
}
