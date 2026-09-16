// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageActions } from './MessageActions';
import styles from './MessageActions.module.css';
import type { Message } from '../../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'MessageActions', () => {
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

	it( 'renders a consumer-supplied icon and preserves action behavior', async () => {
		const onRegenerate = vi.fn();
		const message: Message = {
			id: 'agent-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Answer' } ],
			timestamp: 1,
			archived: false,
			showIcon: true,
			actions: [
				{
					id: 'regenerate',
					label: 'Regenerate',
					icon: <svg data-testid="regenerate-icon" />,
					onClick: onRegenerate,
				},
			],
		};

		await act( async () => {
			root.render( <MessageActions message={ message } /> );
		} );

		const button = container.querySelector(
			'button[aria-label="Regenerate"]'
		) as HTMLButtonElement | null;

		expect( button ).not.toBeNull();
		expect( button?.querySelector( '[data-testid="regenerate-icon"]' ) ).not.toBeNull();

		await act( async () => {
			button?.click();
		} );

		expect( onRegenerate ).toHaveBeenCalledWith( message );
	} );

	it( 'uses explicit actions for custom placement', async () => {
		const onClick = vi.fn();
		const message: Message = {
			id: 'agent-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Answer' } ],
			timestamp: 1,
			archived: false,
			showIcon: true,
		};

		await act( async () => {
			root.render(
				<MessageActions
					message={ message }
					actions={ [
						{
							id: 'regenerate',
							label: 'Regenerate',
							onClick,
						},
					] }
				/>
			);
		} );

		const button = container.querySelector(
			'button[aria-label="Regenerate"]'
		) as HTMLButtonElement | null;

		await act( async () => {
			button?.click();
		} );

		expect( onClick ).toHaveBeenCalledWith( message );
	} );

	it( 'floats reveal-on-hover actions in a panel below the inline ones', async () => {
		const message: Message = {
			id: 'agent-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Answer' } ],
			timestamp: 1,
			archived: false,
			showIcon: true,
			actions: [
				{ id: 'feedback-up', label: 'Good response', onClick: vi.fn(), revealOnHover: true },
				{
					type: 'component',
					id: 'copy',
					component: () => <button aria-label="Copy" />,
					revealOnHover: true,
				},
				{ id: 'share', label: 'Share', onClick: vi.fn() },
			],
		};

		await act( async () => {
			root.render( <MessageActions message={ message } /> );
		} );

		const panel = container.querySelector( `.${ styles.floating }` );
		const dock = container.querySelector( `.${ styles.dock }` );

		expect( panel?.querySelector( 'button[aria-label="Good response"]' ) ).not.toBeNull();
		expect( panel?.querySelector( 'button[aria-label="Copy"]' )?.parentElement?.className ).toBe(
			styles.componentWrapper
		);
		expect( panel?.querySelector( 'button[aria-label="Share"]' ) ).toBeNull();
		expect( container.querySelector( 'button[aria-label="Share"]' ) ).not.toBeNull();
		expect( dock?.classList.contains( styles.docked ) ).toBe( false );
	} );

	it( 'keeps inline component actions as direct items of the row', async () => {
		const message: Message = {
			id: 'agent-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Answer' } ],
			timestamp: 1,
			archived: false,
			showIcon: true,
			actions: [
				{
					type: 'component',
					id: 'checkpoint',
					component: () => <div data-testid="checkpoint" />,
				},
			],
		};

		await act( async () => {
			root.render( <MessageActions message={ message } /> );
		} );

		const checkpoint = container.querySelector( '[data-testid="checkpoint"]' );
		expect( checkpoint?.parentElement?.className ).toBe( styles.container );
	} );

	it( 'docks the panel once one of its actions is pressed', async () => {
		const message: Message = {
			id: 'agent-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Answer' } ],
			timestamp: 1,
			archived: false,
			showIcon: true,
			actions: [
				{
					id: 'feedback-up',
					label: 'Good response',
					onClick: vi.fn(),
					pressed: true,
					revealOnHover: true,
				},
				{ id: 'feedback-down', label: 'Bad response', onClick: vi.fn(), revealOnHover: true },
			],
		};

		await act( async () => {
			root.render( <MessageActions message={ message } /> );
		} );

		expect(
			container.querySelector( `.${ styles.dock }` )?.classList.contains( styles.docked )
		).toBe( true );
	} );
} );
