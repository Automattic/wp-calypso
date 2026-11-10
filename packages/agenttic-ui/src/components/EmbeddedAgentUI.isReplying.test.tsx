// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AgentUI } from '../embedded-agent-ui';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'embedded public entry thinking indicator', () => {
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

	async function render( isReplying: boolean ) {
		await act( async () => {
			root.render(
				<AgentUI.Container
					messages={ [] }
					isProcessing
					isReplying={ isReplying }
					onSubmit={ () => {} }
				>
					<AgentUI.Messages />
				</AgentUI.Container>
			);
		} );
	}

	it( 'hides the thinking indicator while the reply streams in', async () => {
		const thinking = () => container.querySelector( '.agenttic-embedded__thinking' );

		await render( true );

		expect( thinking() ).toBeNull();

		await render( false );

		expect( thinking() ).not.toBeNull();
	} );
} );
