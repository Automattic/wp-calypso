import { store as blockEditorStore } from '@wordpress/block-editor';
import { getBlockContent, getBlockType, type Block } from '@wordpress/blocks';
import { useRegistry } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import type { EditorSelection } from './selection-context';
import type { FormEvent, MouseEvent } from 'react';

export type Prompt = 'review' | 'title' | 'proofread';
// Text the user selected in one top-level block; `block` starts at 1.
export type TextSelection = { block: number; text: string };

const CHIPS: [ Prompt, string ][] = [
	[ 'review', 'Editorial feedback' ],
	[ 'title', 'Optimize title' ],
	[ 'proofread', 'Proofread' ],
];

// The selected text, when it is inside one top-level block of the canvas.
function readSelection(): TextSelection | undefined {
	const selection = document.getSelection();
	const node = selection?.anchorNode;
	if ( ! selection || selection.isCollapsed || ! node ) {
		return undefined;
	}
	const element = node instanceof Element ? node : node.parentElement;
	const block = element?.closest( '.editor-styles-wrapper .is-root-container > [data-block]' );
	if ( ! block?.parentElement || ! block.contains( selection.focusNode ) ) {
		return undefined;
	}
	// Selection#toString puts line breaks between list items; the model gets single spaces.
	const text = selection.toString().replace( /\s+/g, ' ' ).trim();
	const blocks = Array.from( block.parentElement.children ).filter( ( child ) =>
		child.matches( '[data-block]' )
	);
	return text ? { block: blocks.indexOf( block ) + 1, text } : undefined;
}

const CONTEXT_DELAY = 400;

// The text of a block's markup, with a space at each line break and cell, so words don't join.
const plainText = ( html: string ) =>
	(
		new DOMParser().parseFromString(
			html.replace( /<br\s*\/?>|<\/(?:p|li|td|th|tr|h[1-6]|div|figcaption|dt|dd)>/gi, '$& ' ),
			'text/html'
		).body.textContent ?? ''
	)
		.replace( /\s+/g, ' ' )
		.trim();

const typeTitle = ( name: string ) => getBlockType( name )?.title ?? name;

// The selected blocks, and the text highlighted in one; nothing while the title has the focus.
export function readEditorSelection(
	registry: ReturnType< typeof useRegistry >
): EditorSelection | undefined {
	if ( document.activeElement?.closest( '.mcp-post-editor__title' ) ) {
		return undefined;
	}
	const editor = registry.select( blockEditorStore );
	const order = editor.getBlockOrder();
	const blocks = editor.getSelectedBlockClientIds().flatMap( ( clientId ) => {
		const block: Block | null = editor.getBlock( clientId );
		if ( ! block ) {
			return [];
		}
		const top = editor.getBlockParents( clientId )[ 0 ] ?? clientId;
		return {
			index: order.indexOf( top ) + 1,
			type: typeTitle( block.name ),
			parent: top === clientId ? undefined : typeTitle( editor.getBlockName( top ) ?? '' ),
			text: plainText( getBlockContent( block ) ),
		};
	} );
	if ( ! blocks.length ) {
		return undefined;
	}
	const text = blocks.length === 1 ? readSelection()?.text : undefined;
	return { blocks, text };
}

// Reports the selection once it has settled, and nothing once the canvas goes. Inside the
// editor's provider, whose registry has the canvas's block editor store.
export function SelectionReporter( {
	onSelect,
}: {
	onSelect: ( selection?: EditorSelection ) => void;
} ) {
	const registry = useRegistry();
	const onSelectRef = useRef( onSelect );
	onSelectRef.current = onSelect;
	useEffect( () => {
		let timer: ReturnType< typeof setTimeout > | undefined;
		const report = () => {
			clearTimeout( timer );
			timer = setTimeout(
				() => onSelectRef.current( readEditorSelection( registry ) ),
				CONTEXT_DELAY
			);
		};
		const unsubscribe = registry.subscribe( report, blockEditorStore );
		document.addEventListener( 'selectionchange', report );
		return () => {
			clearTimeout( timer );
			unsubscribe();
			document.removeEventListener( 'selectionchange', report );
			onSelectRef.current( undefined );
		};
	}, [ registry ] );
	return null;
}

// Prompts for the assistant, sent to the chat, as pills in the bar.
export function AssistantChips( {
	canMessage,
	onPrompt,
}: {
	canMessage: boolean;
	onPrompt: ( prompt: Prompt ) => void;
} ) {
	return (
		<div className="mcp-post-editor__chips" role="group" aria-label="Ask the assistant">
			{ CHIPS.map( ( [ prompt, label ] ) => (
				<button
					key={ prompt }
					type="button"
					className="mcp-post-editor__chip"
					disabled={ ! canMessage }
					onClick={ () => onPrompt( prompt ) }
				>
					{ label }
				</button>
			) ) }
		</div>
	);
}

const ASK_WIDTH = 56;
const ASK_HEIGHT = 32;

// Where the Ask chip goes: above the selected text, or below it at the canvas's top, kept inside
// the canvas and above the dock's pills.
function chipPlace() {
	const selection = document.getSelection();
	const canvas = document.querySelector( '.mcp-post-editor__canvas' )?.getBoundingClientRect();
	if ( ! selection?.rangeCount || ! canvas ) {
		return undefined;
	}
	const dock = document.querySelector( '.mcp-post-editor__dock' )?.getBoundingClientRect();
	const bottom = dock?.height ? Math.min( canvas.bottom, dock.top - 8 ) : canvas.bottom;
	const rect = selection.getRangeAt( 0 ).getBoundingClientRect();
	if ( rect.bottom < canvas.top || rect.top > canvas.bottom ) {
		return undefined;
	}
	const above = rect.top - ASK_HEIGHT - 8;
	return {
		top: Math.min( above >= canvas.top + 4 ? above : rect.bottom + 8, bottom - ASK_HEIGHT ),
		left: Math.max(
			canvas.left + 8,
			Math.min( rect.left + rect.width / 2 - ASK_WIDTH / 2, canvas.right - ASK_WIDTH - 8 )
		),
	};
}

// Ask on the text the user selected: a chip over the selection, which opens an input in the dock.
export function AskAssistant( {
	canMessage,
	onAsk,
}: {
	canMessage: boolean;
	onAsk: ( question: string, selection: TextSelection ) => void;
} ) {
	const [ selection, setSelection ] = useState< TextSelection >();
	const [ place, setPlace ] = useState< { top: number; left: number } >();
	// The selection Ask is about, kept while its input has the focus.
	const [ asking, setAsking ] = useState< TextSelection >();
	const [ question, setQuestion ] = useState( '' );

	useEffect( () => {
		// The chip follows the text as the canvas scrolls, or moves when the panel or the rows
		// above the canvas change size.
		const onMove = () => setPlace( readSelection() && chipPlace() );
		const observer = new ResizeObserver( onMove );
		// The canvas the selection is in; another post gets a new one.
		let observed: Element | null = null;
		const onSelectionChange = () => {
			const next = readSelection();
			const canvas = document.querySelector( '.mcp-post-editor__canvas' );
			if ( canvas !== observed ) {
				observer.disconnect();
				if ( canvas ) {
					observer.observe( canvas );
				}
				observed = canvas;
			}
			setSelection( next );
			setPlace( next && chipPlace() );
		};
		document.addEventListener( 'selectionchange', onSelectionChange );
		document.addEventListener( 'scroll', onMove, true );
		window.addEventListener( 'resize', onMove );
		return () => {
			document.removeEventListener( 'selectionchange', onSelectionChange );
			document.removeEventListener( 'scroll', onMove, true );
			window.removeEventListener( 'resize', onMove );
			observer.disconnect();
		};
	}, [] );

	const submit = ( event: FormEvent ) => {
		event.preventDefault();
		if ( asking && question.trim() ) {
			onAsk( question.trim(), asking );
			setAsking( undefined );
			setQuestion( '' );
		}
	};

	if ( asking ) {
		return (
			<form className="mcp-post-editor__pill mcp-post-editor__ask" onSubmit={ submit }>
				<input
					className="mcp-post-editor__ask-input"
					aria-label={ `Ask about the selected text in block ${ asking.block }` }
					placeholder="Ask about this…"
					maxLength={ 2000 }
					value={ question }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					onChange={ ( event ) => setQuestion( event.target.value ) }
					onKeyDown={ ( event ) => event.key === 'Escape' && setAsking( undefined ) }
				/>
				<button type="button" onClick={ () => setAsking( undefined ) }>
					Cancel
				</button>
				<span aria-hidden="true">·</span>
				<button type="submit" className="is-send" disabled={ ! canMessage || ! question.trim() }>
					Send
				</button>
			</form>
		);
	}
	if ( ! selection || ! place ) {
		return null;
	}
	return (
		<button
			type="button"
			className="mcp-post-editor__ask-chip"
			style={ { top: place.top, left: place.left } }
			disabled={ ! canMessage }
			// Keeps the text selected until the click.
			onMouseDown={ ( event: MouseEvent ) => event.preventDefault() }
			onClick={ () => setAsking( selection ) }
		>
			Ask
		</button>
	);
}
