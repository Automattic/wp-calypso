import { useEffect, useRef, useState } from '@wordpress/element';
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
	onSelect,
}: {
	canMessage: boolean;
	onAsk: ( question: string, selection: TextSelection ) => void;
	onSelect: ( selection?: TextSelection ) => void;
} ) {
	const [ selection, setSelection ] = useState< TextSelection >();
	const [ place, setPlace ] = useState< { top: number; left: number } >();
	// The selection Ask is about, kept while its input has the focus.
	const [ asking, setAsking ] = useState< TextSelection >();
	const [ question, setQuestion ] = useState( '' );
	const onSelectRef = useRef( onSelect );
	onSelectRef.current = onSelect;

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
			onSelectRef.current( next );
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
