import { Button } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import type { FormEvent, MouseEvent } from 'react';

export type Prompt = 'review' | 'title' | 'proofread';
// Text the user selected in one top-level block; `block` starts at 1.
export type TextSelection = { block: number; text: string };

const CHIPS: [ Prompt, string ][] = [
	[ 'review', 'Editorial review' ],
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

// Prompts for the assistant, sent to the chat, and Ask on the text the user selected.
export function AssistantBar( {
	canMessage,
	onPrompt,
	onAsk,
	onSelect,
}: {
	canMessage: boolean;
	onPrompt: ( prompt: Prompt ) => void;
	onAsk: ( question: string, selection: TextSelection ) => void;
	onSelect: ( selection?: TextSelection ) => void;
} ) {
	const [ selection, setSelection ] = useState< TextSelection >();
	// The selection Ask is about, kept while its input has the focus.
	const [ asking, setAsking ] = useState< TextSelection >();
	const [ question, setQuestion ] = useState( '' );
	const onSelectRef = useRef( onSelect );
	onSelectRef.current = onSelect;

	useEffect( () => {
		const onSelectionChange = () => {
			const next = readSelection();
			setSelection( next );
			onSelectRef.current( next );
		};
		document.addEventListener( 'selectionchange', onSelectionChange );
		return () => document.removeEventListener( 'selectionchange', onSelectionChange );
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
			<form className="mcp-post-editor__chips" onSubmit={ submit }>
				<input
					className="mcp-post-editor__ask-input"
					aria-label={ `Ask about the selected text in block ${ asking.block }` }
					placeholder="Ask about the selection…"
					maxLength={ 2000 }
					value={ question }
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					onChange={ ( event ) => setQuestion( event.target.value ) }
					onKeyDown={ ( event ) => event.key === 'Escape' && setAsking( undefined ) }
				/>
				<Button
					size="compact"
					variant="primary"
					type="submit"
					disabled={ ! canMessage || ! question.trim() }
				>
					Send
				</Button>
				<Button size="compact" variant="tertiary" onClick={ () => setAsking( undefined ) }>
					Cancel
				</Button>
			</form>
		);
	}
	return (
		<div className="mcp-post-editor__chips" role="group" aria-label="Ask the assistant">
			{ selection && (
				<Button
					size="compact"
					variant="primary"
					disabled={ ! canMessage }
					// Keeps the text selected until the click.
					onMouseDown={ ( event: MouseEvent ) => event.preventDefault() }
					onClick={ () => setAsking( selection ) }
				>
					Ask
				</Button>
			) }
			{ CHIPS.map( ( [ prompt, label ] ) => (
				<Button
					key={ prompt }
					size="compact"
					variant="secondary"
					disabled={ ! canMessage }
					onClick={ () => onPrompt( prompt ) }
				>
					{ label }
				</Button>
			) ) }
		</div>
	);
}
