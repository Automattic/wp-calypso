// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Message } from '../../types';
import { MessageActions } from './MessageActions';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

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
		expect(
			button?.querySelector( '[data-testid="regenerate-icon"]' )
		).not.toBeNull();

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
} );
