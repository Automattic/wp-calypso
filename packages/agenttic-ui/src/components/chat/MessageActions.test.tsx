// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageActions } from './MessageActions';
import styles from './MessageActions.module.css';
import type { Message, MessageAction } from '../../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

const agentMessage = ( actions?: MessageAction[] ): Message => ( {
	id: 'agent-1',
	role: 'agent',
	content: [ { type: 'text', text: 'Answer' } ],
	timestamp: 1,
	archived: false,
	showIcon: true,
	actions,
} );

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
		const message = agentMessage( [
			{
				id: 'regenerate',
				label: 'Regenerate',
				icon: <svg data-testid="regenerate-icon" />,
				onClick: onRegenerate,
			},
		] );

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
		const message = agentMessage();

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

	it.each( [
		{
			name: 'shows every action inline on the settled latest turn',
			isLatestTurn: true,
			isStreaming: false,
			pressed: false,
			expected: { undo: 'inline', up: 'inline', down: 'inline', copy: 'inline', docked: false },
		},
		{
			name: 'holds latest-turn actions back while the latest turn streams',
			isLatestTurn: true,
			isStreaming: true,
			pressed: false,
			expected: { undo: 'inline', up: 'hidden', down: 'hidden', copy: 'hidden', docked: false },
		},
		{
			name: 'keeps a pressed latest-turn action while the latest turn streams',
			isLatestTurn: true,
			isStreaming: true,
			pressed: true,
			expected: { undo: 'inline', up: 'hidden', down: 'inline', copy: 'hidden', docked: false },
		},
		{
			name: 'floats latest-turn actions of an earlier turn in the panel',
			isLatestTurn: false,
			isStreaming: true,
			pressed: false,
			expected: { undo: 'inline', up: 'panel', down: 'panel', copy: 'panel', docked: false },
		},
		{
			name: 'docks the panel once one of its actions is pressed',
			isLatestTurn: false,
			isStreaming: true,
			pressed: true,
			expected: { undo: 'inline', up: 'panel', down: 'panel', copy: 'panel', docked: true },
		},
	] )( '$name', async ( { isLatestTurn, isStreaming, pressed, expected } ) => {
		const message = agentMessage( [
			{ id: 'checkpoint', label: 'Undo', onClick: vi.fn() },
			{ id: 'feedback-up', label: 'Good response', onClick: vi.fn(), visibility: 'latest-turn' },
			{
				id: 'feedback-down',
				label: 'Bad response',
				onClick: vi.fn(),
				pressed,
				visibility: 'latest-turn',
			},
			{
				type: 'component',
				id: 'copy',
				component: () => <button aria-label="Copy" />,
				visibility: 'latest-turn',
			},
		] );

		await act( async () => {
			root.render(
				<MessageActions
					message={ message }
					isLatestTurn={ isLatestTurn }
					isStreaming={ isStreaming }
				/>
			);
		} );

		const placementOf = ( label: string ) => {
			const button = container.querySelector( `button[aria-label="${ label }"]` );

			if ( ! button ) {
				return 'hidden';
			}

			return button.closest( `.${ styles.floating }` ) ? 'panel' : 'inline';
		};

		expect( {
			undo: placementOf( 'Undo' ),
			up: placementOf( 'Good response' ),
			down: placementOf( 'Bad response' ),
			copy: placementOf( 'Copy' ),
			docked: container.querySelector( `.${ styles.docked }` ) !== null,
		} ).toEqual( expected );
	} );

	it( 'aligns a component action inside the panel and keeps inline ones direct', async () => {
		const message = agentMessage( [
			{ type: 'component', id: 'checkpoint', component: () => <div data-testid="checkpoint" /> },
			{
				type: 'component',
				id: 'copy',
				component: () => <button aria-label="Copy" />,
				visibility: 'latest-turn',
			},
		] );

		await act( async () => {
			root.render( <MessageActions message={ message } isLatestTurn={ false } /> );
		} );

		expect(
			container.querySelector( '[data-testid="checkpoint"]' )?.parentElement?.className
		).toBe( styles.container );
		expect( container.querySelector( 'button[aria-label="Copy"]' )?.parentElement?.className ).toBe(
			styles.componentWrapper
		);
	} );

	it( 'renders nothing while every action is held back', async () => {
		const message = agentMessage( [
			{ id: 'feedback-up', label: 'Good response', onClick: vi.fn(), visibility: 'latest-turn' },
		] );

		await act( async () => {
			root.render( <MessageActions message={ message } isStreaming /> );
		} );

		expect( container.querySelector( '[role="toolbar"]' ) ).toBeNull();
	} );
} );
