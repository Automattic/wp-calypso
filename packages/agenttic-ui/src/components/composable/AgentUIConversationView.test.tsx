// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentUIContainer } from '../AgentUIContainer';
import { AgentUIConversationView } from './AgentUIConversationView';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'AgentUIConversationView Escape handling', () => {
	let container: HTMLDivElement;
	let root: Root;
	const onClose = vi.fn();

	const render = async () => {
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					onClose={ onClose }
					variant="floating"
					floatingChatState="expanded"
				>
					<AgentUIConversationView>
						<div>content</div>
					</AgentUIConversationView>
				</AgentUIContainer>
			);
		} );
	};

	const pressEscape = async ( defaultPrevented = false ) => {
		const event = new KeyboardEvent( 'keydown', {
			key: 'Escape',
			bubbles: true,
			cancelable: true,
		} );
		if ( defaultPrevented ) {
			event.preventDefault();
		}
		await act( async () => {
			document.dispatchEvent( event );
		} );
	};

	beforeEach( () => {
		onClose.mockClear();
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

	it( 'closes the chat on Escape', async () => {
		await render();
		await pressEscape();
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'leaves Escape alone when an overlay already handled it', async () => {
		await render();
		await pressEscape( true );
		expect( onClose ).not.toHaveBeenCalled();
	} );
} );
