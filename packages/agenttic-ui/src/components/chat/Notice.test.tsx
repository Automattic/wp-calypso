// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentUI } from '../../embedded-agent-ui';
import { Notice } from './Notice';
import type { NoticeConfig } from '../../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe.each( [ 'standard', 'embedded' ] )( '%s notice actions', ( renderer ) => {
	let container: HTMLDivElement;
	let root: Root;
	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );
	afterEach( async () => {
		await act( async () => root.unmount() );
		container.remove();
	} );
	const render = async ( notice: NoticeConfig ) => {
		await act( async () => {
			root.render(
				renderer === 'standard' ? (
					<Notice { ...notice } />
				) : (
					<AgentUI.Container
						messages={ [] }
						isProcessing={ false }
						onSubmit={ () => {} }
						notice={ notice }
					>
						<AgentUI.Notice />
					</AgentUI.Container>
				)
			);
		} );
	};

	it( 'renders a native link with the supplied destination and browsing context', async () => {
		await render( {
			message: '20% of site credits left.',
			action: {
				label: 'Upgrade',
				href: 'https://wordpress.com/plans/example.wordpress.com',
				target: '_blank',
				rel: 'noopener noreferrer',
			},
		} );
		const link = container.querySelector( 'a' )!;
		expect( link?.textContent ).toBe( 'Upgrade' );
		expect( link.getAttribute( 'href' ) ).toBe(
			'https://wordpress.com/plans/example.wordpress.com'
		);
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
		expect( container.querySelector( 'button' ) ).toBeNull();
		await render( { message: 'Details', action: { label: 'Details', href: '/details' } } );
		expect( container.querySelector( 'a' )?.hasAttribute( 'target' ) ).toBe( false );
	} );

	it( 'preserves callback actions and omits unavailable actions', async () => {
		const onClick = vi.fn();
		await render( { message: 'Notice', action: { label: 'Retry', onClick } } );
		const button = container.querySelector( 'button' )!;
		expect( button.textContent ).toBe( 'Retry' );
		expect( button.getAttribute( 'type' ) ).toBe( 'button' );
		await act( async () => button.click() );
		expect( onClick ).toHaveBeenCalledOnce();
		expect( container.querySelector( 'a' ) ).toBeNull();
		await render( { message: 'Notice' } );
		expect( container.querySelector( 'button, a' ) ).toBeNull();
	} );

	if ( renderer === 'standard' ) {
		it( 'keeps the dismiss control independent from the link', async () => {
			const onDismiss = vi.fn();
			await render( {
				message: '20% of site credits left.',
				action: { label: 'Upgrade', href: '/plans' },
				dismissible: true,
				onDismiss,
			} );
			const dismiss = container.querySelector< HTMLButtonElement >( 'button' )!;
			expect( dismiss.getAttribute( 'aria-label' ) ).toBe( 'Dismiss notice' );
			expect( dismiss.getAttribute( 'type' ) ).toBe( 'button' );
			expect( dismiss.querySelector( 'svg' ) ).not.toBeNull();
			await act( async () => dismiss.click() );
			expect( onDismiss ).toHaveBeenCalledOnce();
			expect( container.querySelector( 'a' )?.getAttribute( 'href' ) ).toBe( '/plans' );
		} );
	}
} );
