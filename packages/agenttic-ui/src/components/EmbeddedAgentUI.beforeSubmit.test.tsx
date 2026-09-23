// @vitest-environment jsdom
import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentUI, type AgentUIProps, type Suggestion } from '../embedded-agent-ui';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

const suggestion: Suggestion = {
	id: 'run',
	label: 'Run this',
	prompt: '  Run this prompt  ',
	autoSubmit: true,
};
const suggestions = [ suggestion ];

describe( 'embedded public entry composer', () => {
	let container: HTMLDivElement;
	let root: Root;
	let file: File;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		file = new File( [ 'attachment' ], 'notes.txt', { type: 'text/plain' } );
	} );

	afterEach( async () => {
		await act( async () => root.unmount() );
		container.remove();
	} );

	async function render(
		props: Partial< AgentUIProps >,
		onSelect?: ( value: string ) => void,
		inputProps?: ComponentProps< typeof AgentUI.Input >
	) {
		await act( async () => {
			root.render(
				<AgentUI.Container
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					allowAttachments
					{ ...props }
				>
					<AgentUI.Suggestions showSuggestions onSelect={ onSelect } />
					<AgentUI.Input { ...inputProps } />
				</AgentUI.Container>
			);
		} );
	}

	async function writeDraftAndAttachFile() {
		const textarea = container.querySelector( 'textarea' )!;
		const fileInput = container.querySelector< HTMLInputElement >( 'input[type="file"]' )!;
		await act( async () => {
			Object.getOwnPropertyDescriptor( HTMLTextAreaElement.prototype, 'value' )!.set!.call(
				textarea,
				'  keep my draft  '
			);
			textarea.dispatchEvent( new Event( 'input', { bubbles: true } ) );
			Object.defineProperty( fileInput, 'files', { configurable: true, value: [ file ] } );
			fileInput.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} );
		return textarea;
	}

	async function send( method: 'button' | 'Enter' ) {
		await act( async () => {
			if ( method === 'button' ) {
				container
					.querySelector< HTMLButtonElement >( 'button[aria-label="Send message"]' )!
					.click();
			} else {
				container
					.querySelector( 'textarea' )!
					.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter', bubbles: true } ) );
			}
		} );
	}

	it.each( [ 'button', 'Enter' ] as const )(
		'gates input %s once and preserves draft and files until accepted',
		async ( method ) => {
			const beforeSubmit = vi.fn( () => false );
			const onSubmit = vi.fn();
			await render( {
				beforeSubmit,
				onSubmit,
				trailingActions: ( submit ) => <div data-testid="submit-wrapper">{ submit }</div>,
			} );
			expect( container.querySelectorAll( '[aria-label="Send message"]' ) ).toHaveLength( 1 );
			expect( container.querySelector( '[data-testid="submit-wrapper"] button' ) ).not.toBeNull();
			const textarea = await writeDraftAndAttachFile();
			await send( method );
			expect( beforeSubmit ).toHaveBeenCalledOnce();
			expect( beforeSubmit ).toHaveBeenCalledWith( 'keep my draft', 'input' );
			expect( onSubmit ).not.toHaveBeenCalled();
			expect( textarea.value ).toBe( '  keep my draft  ' );
			expect( container.querySelector( '.agenttic-embedded__attachment-count' )?.textContent ).toBe(
				'1'
			);

			beforeSubmit.mockClear().mockReturnValue( true );
			await send( method );
			expect( beforeSubmit ).toHaveBeenCalledOnce();
			expect( beforeSubmit ).toHaveBeenCalledWith( 'keep my draft', 'input' );
			expect( onSubmit ).toHaveBeenCalledOnce();
			expect( onSubmit ).toHaveBeenCalledWith( 'keep my draft', [ file ] );
			expect( textarea.value ).toBe( '' );
			expect( container.querySelector( '.agenttic-embedded__attachment-count' ) ).toBeNull();
		}
	);

	it( 'gates auto-submit suggestions before selection callbacks and preserves draft, files and suggestions', async () => {
		const events: string[] = [];
		const beforeSubmit = vi.fn( () => {
			events.push( 'gate' );
			return false;
		} );
		const onSelect = vi.fn( () => events.push( 'select' ) );
		const onSuggestionClick = vi.fn( () => events.push( 'click' ) );
		const clearSuggestions = vi.fn( () => events.push( 'clear' ) );
		const onSubmit = vi.fn( () => {
			events.push( 'submit' );
		} );
		await render(
			{ beforeSubmit, onSubmit, suggestions, onSuggestionClick, clearSuggestions },
			onSelect
		);
		const textarea = await writeDraftAndAttachFile();
		const suggestionButton = container.querySelector< HTMLButtonElement >(
			'.agenttic-embedded__suggestions button'
		)!;
		await act( async () => suggestionButton.click() );
		expect( beforeSubmit ).toHaveBeenCalledOnce();
		expect( beforeSubmit ).toHaveBeenCalledWith( 'Run this prompt', 'suggestion' );
		expect( events ).toEqual( [ 'gate' ] );
		expect( onSelect ).not.toHaveBeenCalled();
		expect( onSuggestionClick ).not.toHaveBeenCalled();
		expect( clearSuggestions ).not.toHaveBeenCalled();
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( textarea.value ).toBe( '  keep my draft  ' );
		expect( container.querySelector( '.agenttic-embedded__attachment-count' )?.textContent ).toBe(
			'1'
		);
		expect( container.contains( suggestionButton ) ).toBe( true );

		events.length = 0;
		beforeSubmit.mockClear().mockImplementation( () => {
			events.push( 'gate' );
			return true;
		} );
		await act( async () => suggestionButton.click() );
		expect( events ).toEqual( [ 'gate', 'select', 'click', 'clear', 'submit' ] );
		expect( beforeSubmit ).toHaveBeenCalledOnce();
		expect( beforeSubmit ).toHaveBeenCalledWith( 'Run this prompt', 'suggestion' );
		expect( onSelect ).toHaveBeenCalledOnce();
		expect( onSelect ).toHaveBeenCalledWith( suggestion.prompt );
		expect( onSuggestionClick ).toHaveBeenCalledOnce();
		expect( onSuggestionClick ).toHaveBeenCalledWith( suggestion, suggestions );
		expect( clearSuggestions ).toHaveBeenCalledOnce();
		expect( onSubmit ).toHaveBeenCalledOnce();
		expect( onSubmit ).toHaveBeenCalledWith( 'Run this prompt', [ file ] );
		expect( textarea.value ).toBe( '' );
		expect( container.querySelector( '.agenttic-embedded__attachment-count' ) ).toBeNull();
	} );

	it( 'keeps non-auto-submit suggestion selection available without invoking the gate', async () => {
		const manual = { ...suggestion, autoSubmit: false };
		const beforeSubmit = vi.fn( () => false );
		const onSelect = vi.fn();
		const onSuggestionClick = vi.fn();
		const clearSuggestions = vi.fn();
		const onSubmit = vi.fn();
		await render(
			{ beforeSubmit, onSubmit, suggestions: [ manual ], onSuggestionClick, clearSuggestions },
			onSelect
		);
		const textarea = await writeDraftAndAttachFile();
		await act( async () =>
			container
				.querySelector< HTMLButtonElement >( '.agenttic-embedded__suggestions button' )!
				.click()
		);
		expect( beforeSubmit ).not.toHaveBeenCalled();
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( onSelect ).toHaveBeenCalledOnce();
		expect( onSelect ).toHaveBeenCalledWith( manual.prompt );
		expect( onSuggestionClick ).toHaveBeenCalledOnce();
		expect( onSuggestionClick ).toHaveBeenCalledWith( manual, [ manual ] );
		expect( clearSuggestions ).toHaveBeenCalledOnce();
		expect( textarea.value ).toBe( manual.prompt );
		expect( container.querySelector( '.agenttic-embedded__attachment-count' )?.textContent ).toBe(
			'1'
		);
	} );

	it( 'renders interactive leading and trailing nodes in order through the direct public entry', async () => {
		const onLeading = vi.fn();
		const onTrailing = vi.fn();
		await act( async () =>
			root.render(
				<AgentUI
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					allowAttachments
					leadingActions={ <button onClick={ onLeading }>Leading</button> }
					trailingActions={ <button onClick={ onTrailing }>Trailing</button> }
				/>
			)
		);
		const input = container.querySelector( '[data-slot="chat-input"]' )!;
		const controls = Array.from( input.querySelectorAll( 'button, textarea' ) );
		expect(
			controls.map( ( control ) => control.getAttribute( 'aria-label' ) ?? control.textContent )
		).toEqual( [ 'Upload file', 'Leading', 'Chat input', 'Trailing', 'Send message' ] );
		await act( async () => {
			( controls[ 1 ] as HTMLButtonElement ).click();
			( controls[ 3 ] as HTMLButtonElement ).click();
		} );
		expect( onLeading ).toHaveBeenCalledOnce();
		expect( onTrailing ).toHaveBeenCalledOnce();
		expect( ( controls[ 4 ] as HTMLButtonElement ).disabled ).toBe( true );
	} );

	it( 'passes the real Send and Stop control once per render to a direct-entry trailing callback', async () => {
		const onSubmit = vi.fn();
		const onStop = vi.fn();
		const trailingActions = vi.fn( ( submit: React.ReactNode ) => (
			<div data-testid="direct-wrapper">{ submit }</div>
		) );
		const props = {
			messages: [],
			isProcessing: false,
			onSubmit,
			onStop,
			inputValue: 'draft',
			trailingActions,
		};
		await act( async () => root.render( <AgentUI { ...props } /> ) );
		expect( trailingActions ).toHaveBeenCalledOnce();
		const wrapper = container.querySelector( '[data-testid="direct-wrapper"]' )!;
		expect( container.querySelectorAll( '[aria-label="Send message"]' ) ).toHaveLength( 1 );
		await act( async () => wrapper.querySelector< HTMLButtonElement >( 'button' )!.click() );
		expect( onSubmit ).toHaveBeenCalledOnce();
		expect( onSubmit ).toHaveBeenCalledWith( 'draft', undefined );
		trailingActions.mockClear();
		await act( async () => root.render( <AgentUI { ...props } isProcessing /> ) );
		expect( trailingActions ).toHaveBeenCalledOnce();
		expect( container.querySelectorAll( '[aria-label="Stop processing"]' ) ).toHaveLength( 1 );
		await act( async () => wrapper.querySelector< HTMLButtonElement >( 'button' )!.click() );
		expect( onStop ).toHaveBeenCalledOnce();
		expect( onSubmit ).toHaveBeenCalledOnce();
	} );

	it( 'lets compound input slots override container slots and wraps the real disabled Send/Stop control', async () => {
		const beforeSubmit = vi.fn();
		const onSubmit = vi.fn();
		const onStop = vi.fn();
		const props = {
			beforeSubmit,
			onSubmit,
			onStop,
			inputValue: 'draft',
			leadingActions: <button>Container leading</button>,
			trailingActions: <button>Container trailing</button>,
		};
		const inputProps = {
			leadingActions: <button>Input leading</button>,
			trailingActions: ( submit: React.ReactNode ) => (
				<div data-testid="wrapped">
					{ submit }
					<button>Input trailing</button>
				</div>
			),
		};
		await render( props, undefined, { ...inputProps, disabled: true } );
		expect( container.textContent ).toContain( 'Input leading' );
		expect( container.textContent ).not.toContain( 'Container leading' );
		expect( container.textContent ).not.toContain( 'Container trailing' );
		const sendButton = container.querySelector< HTMLButtonElement >(
			'[aria-label="Send message"]'
		)!;
		expect( sendButton.disabled ).toBe( true );
		await act( async () => sendButton.click() );
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( beforeSubmit ).not.toHaveBeenCalled();

		await render( { ...props, isProcessing: true }, undefined, inputProps );
		expect( container.querySelectorAll( '[aria-label="Stop processing"]' ) ).toHaveLength( 1 );
		expect( container.querySelector( '[aria-label="Send message"]' ) ).toBeNull();
		const wrapper = container.querySelector( '[data-testid="wrapped"]' )!;
		expect(
			Array.from( wrapper.querySelectorAll( 'button' ) ).map(
				( button ) => button.getAttribute( 'aria-label' ) ?? button.textContent
			)
		).toEqual( [ 'Stop processing', 'Input trailing' ] );
		await act( async () => wrapper.querySelector< HTMLButtonElement >( 'button' )!.click() );
		expect( onStop ).toHaveBeenCalledOnce();
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( beforeSubmit ).not.toHaveBeenCalled();
	} );

	it( 'preserves ordinary submission when no gate is provided', async () => {
		const onSubmit = vi.fn();
		await render( { onSubmit } );
		await writeDraftAndAttachFile();
		await send( 'button' );
		expect( onSubmit ).toHaveBeenCalledOnce();
		expect( onSubmit ).toHaveBeenCalledWith( 'keep my draft', [ file ] );
	} );
} );
