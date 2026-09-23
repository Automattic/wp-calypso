// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentUIContainer } from './AgentUIContainer';
import { AgentUIInput } from './composable/AgentUIInput';
import { AgentUISuggestions } from './composable/AgentUISuggestions';
import type { AgentUIProps, Suggestion } from '../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

type BeforeSubmit = NonNullable< AgentUIProps[ 'beforeSubmit' ] >;

const SUGGESTIONS: Suggestion[] = [
	{ id: 'auto', label: 'Run it', prompt: 'Run it now', autoSubmit: true },
];

function setTextareaValue( textarea: HTMLTextAreaElement, value: string ) {
	const setter = Object.getOwnPropertyDescriptor( HTMLTextAreaElement.prototype, 'value' )?.set;
	setter?.call( textarea, value );
	textarea.dispatchEvent( new Event( 'input', { bubbles: true } ) );
}

describe( 'AgentUIContainer beforeSubmit', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	async function render(
		beforeSubmit: BeforeSubmit,
		onSubmit = vi.fn(),
		onSuggestionClick = vi.fn()
	) {
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ onSubmit }
					variant="embedded"
					suggestions={ SUGGESTIONS }
					beforeSubmit={ beforeSubmit }
					onSuggestionClick={ onSuggestionClick }
				>
					<AgentUISuggestions />
					<AgentUIInput />
				</AgentUIContainer>
			);
		} );
		return {
			onSubmit,
			textarea: container.querySelector( 'textarea' ) as HTMLTextAreaElement,
			send: container.querySelector< HTMLButtonElement >( 'button[aria-label="Send message"]' ),
			suggestion: Array.from( container.querySelectorAll( 'button' ) ).find(
				( button ) => button.textContent === 'Run it'
			),
		};
	}

	it( 'keeps the message in the input when the send button is blocked', async () => {
		const beforeSubmit = vi.fn( (): boolean => false );
		const { onSubmit, textarea, send } = await render( beforeSubmit );
		await act( async () => {
			setTextareaValue( textarea, 'hello' );
		} );
		await act( async () => {
			send?.click();
		} );
		expect( beforeSubmit ).toHaveBeenCalledWith( 'hello', 'input' );
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( textarea.value ).toBe( 'hello' );
	} );

	it( 'keeps the message in the input when Enter is blocked', async () => {
		const beforeSubmit = vi.fn( (): boolean => false );
		const { onSubmit, textarea } = await render( beforeSubmit );
		await act( async () => {
			setTextareaValue( textarea, 'hello' );
		} );
		await act( async () => {
			textarea.dispatchEvent(
				new KeyboardEvent( 'keydown', { key: 'Enter', bubbles: true, cancelable: true } )
			);
		} );
		expect( beforeSubmit ).toHaveBeenCalledWith( 'hello', 'input' );
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( textarea.value ).toBe( 'hello' );
	} );

	it( 'blocks an auto-submit suggestion without clearing the list or reporting the click', async () => {
		const beforeSubmit = vi.fn( (): boolean => false );
		const onSuggestionClick = vi.fn();
		const { onSubmit, suggestion } = await render( beforeSubmit, vi.fn(), onSuggestionClick );
		await act( async () => {
			suggestion?.click();
		} );
		expect( beforeSubmit ).toHaveBeenCalledWith( 'Run it now', 'suggestion' );
		expect( onSubmit ).not.toHaveBeenCalled();
		expect( onSuggestionClick ).not.toHaveBeenCalled();
		expect(
			Array.from( container.querySelectorAll( 'button' ) ).some(
				( button ) => button.textContent === 'Run it'
			)
		).toBe( true );
	} );

	it( 'sends and clears the input when allowed', async () => {
		const beforeSubmit = vi.fn( (): boolean => true );
		const { onSubmit, textarea, send } = await render( beforeSubmit );
		await act( async () => {
			setTextareaValue( textarea, 'hello' );
		} );
		await act( async () => {
			send?.click();
		} );
		expect( onSubmit ).toHaveBeenCalledWith( 'hello' );
		expect( textarea.value ).toBe( '' );
	} );
} );
