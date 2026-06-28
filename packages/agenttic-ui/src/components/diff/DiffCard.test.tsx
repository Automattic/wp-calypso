// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DiffCard } from './DiffCard';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'DiffCard', () => {
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

	it( 'renders a string diff with title, summary, and resolve controls', async () => {
		const onResolve = vi.fn();

		await act( async () => {
			root.render(
				<DiffCard
					title="Preview edits"
					summary="Accept or reject to apply changes."
					diff="-old line\n+new line"
					onResolve={ onResolve }
				/>
			);
		} );

		expect(
			container.querySelector( '[data-agenttic-diff-card]' )
		).toBeTruthy();
		expect( container.textContent ).toContain( 'Preview edits' );
		expect( container.textContent ).toContain(
			'Accept or reject to apply changes.'
		);
		expect(
			container.querySelector( '[data-slot="diff"]' )?.textContent
		).toContain( 'new line' );

		const accept = container.querySelector< HTMLButtonElement >(
			'[data-slot="accept"]'
		);
		await act( async () => {
			accept?.click();
		} );
		expect( onResolve ).toHaveBeenCalledWith( 'accepted' );
	} );

	it( 'renders structured before/after changes', async () => {
		await act( async () => {
			root.render(
				<DiffCard
					diff={ [
						{
							label: 'Block 0',
							original: 'Hello world',
							replacement: 'Hello there',
						},
					] }
					onResolve={ vi.fn() }
				/>
			);
		} );

		expect(
			container.querySelector( '[data-slot="original"]' )?.textContent
		).toContain( 'Hello world' );
		expect(
			container.querySelector( '[data-slot="replacement"]' )?.textContent
		).toContain( 'Hello there' );
		expect( container.textContent ).toContain( 'Block 0' );
	} );

	it( 'fires the reject decision', async () => {
		const onResolve = vi.fn();

		await act( async () => {
			root.render( <DiffCard diff="content" onResolve={ onResolve } /> );
		} );

		const reject = container.querySelector< HTMLButtonElement >(
			'[data-slot="reject"]'
		);
		await act( async () => {
			reject?.click();
		} );
		expect( onResolve ).toHaveBeenCalledWith( 'rejected' );
	} );

	it( 'hides controls and shows the resolution once resolved', async () => {
		await act( async () => {
			root.render(
				<DiffCard
					diff="content"
					onResolve={ vi.fn() }
					resolved="accepted"
				/>
			);
		} );

		expect( container.querySelector( '[data-slot="accept"]' ) ).toBeNull();
		expect(
			container.querySelector( '[data-slot="resolution"]' )?.textContent
		).toContain( 'Accepted' );
	} );

	it( 'disables controls when disabled', async () => {
		await act( async () => {
			root.render(
				<DiffCard diff="content" onResolve={ vi.fn() } disabled />
			);
		} );

		const accept = container.querySelector< HTMLButtonElement >(
			'[data-slot="accept"]'
		);
		expect( accept?.disabled ).toBe( true );
	} );

	it( 'lets consumers supply custom diff rendering', async () => {
		await act( async () => {
			root.render(
				<DiffCard
					diff="ignored"
					onResolve={ vi.fn() }
					renderDiff={ () => (
						<div data-slot="custom-diff">Custom diff</div>
					) }
				/>
			);
		} );

		expect(
			container.querySelector( '[data-slot="custom-diff"]' )
		).toBeTruthy();
		expect( container.querySelector( '[data-slot="diff"]' ) ).toBeNull();
	} );
} );
