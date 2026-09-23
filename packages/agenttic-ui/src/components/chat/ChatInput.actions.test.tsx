// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentUIContainer } from '../AgentUIContainer';
import { AgentUIInput } from '../composable/AgentUIInput';
import { ChatInput } from './ChatInput';
import type { ImageUploaderHandle } from './ImageUploader';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

// Order of the interactive controls in the actions row, by accessible name or test id.
function rowOrder( container: HTMLElement ): string[] {
	return Array.from(
		container.querySelectorAll< HTMLElement >( '[data-slot="chat-input"] button, [data-testid]' )
	).map( ( el ) => el.getAttribute( 'data-testid' ) ?? el.getAttribute( 'aria-label' ) ?? '' );
}

describe( 'ChatInput actions row', () => {
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

	const baseProps = {
		value: 'hello',
		onChange: () => {},
		onSubmit: () => {},
		onKeyDown: () => {},
		textareaRef: { current: null },
		isProcessing: false,
		showExpandButton: false,
	};

	async function renderInput( props: Partial< React.ComponentProps< typeof ChatInput > > ) {
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					variant="embedded"
				>
					<ChatInput { ...baseProps } { ...props } />
				</AgentUIContainer>
			);
		} );
	}

	it( 'renders a trailing node right before the submit button', async () => {
		await renderInput( {
			leadingActions: <span data-testid="lead" />,
			trailingActions: <span data-testid="trail" />,
		} );
		expect( rowOrder( container ) ).toEqual( [ 'lead', 'trail', 'Send message' ] );
	} );

	it( 'lets a trailing render function place content after the submit button', async () => {
		await renderInput( {
			trailingActions: ( submit ) => (
				<>
					{ submit }
					<span data-testid="after" />
				</>
			),
		} );
		expect( rowOrder( container ) ).toEqual( [ 'Send message', 'after' ] );
	} );

	it( 'keeps legacy customActions grouped with the submit button', async () => {
		const action = {
			id: 'legacy',
			icon: <span />,
			onClick: () => {},
			'aria-label': 'Legacy',
		};
		await renderInput( {
			customActions: [ action ],
			trailingActions: <span data-testid="trail" />,
		} );
		expect( rowOrder( container ) ).toEqual( [ 'Legacy', 'trail', 'Send message' ] );

		await renderInput( { customActions: [ action ], actionOrder: 'after-submit' } );
		expect( rowOrder( container ) ).toEqual( [ 'Send message', 'Legacy' ] );
	} );

	it( 'groups the trailing content in the stacked layout', async () => {
		await renderInput( { layout: 'stacked', trailingActions: <span data-testid="trail" /> } );
		const group = container.querySelector( '[data-slot="chat-input-trailing-actions"]' );
		expect( group?.querySelector( '[data-testid="trail"]' ) ).not.toBeNull();
		expect( group?.querySelector( 'button[aria-label="Send message"]' ) ).not.toBeNull();
	} );
} );

describe( 'AgentUIInput actions row', () => {
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

	it( 'leads with the upload button, then host leading actions, and trails before Send', async () => {
		const uploaderRef = { current: { openFileDialog: vi.fn() } as unknown as ImageUploaderHandle };
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					variant="embedded"
					inputValue="hello"
					onInputChange={ () => {} }
				>
					<AgentUIInput
						imageUploaderRef={ uploaderRef }
						leadingActions={ <span data-testid="lead" /> }
						trailingActions={ <span data-testid="trail" /> }
					/>
				</AgentUIContainer>
			);
		} );
		expect( rowOrder( container ) ).toEqual( [ 'Upload image', 'lead', 'trail', 'Send message' ] );
		expect(
			container
				.querySelector( '[data-slot="chat-input-leading-actions"]' )
				?.querySelector( 'button[aria-label="Upload image"]' )
		).not.toBeNull();
	} );
} );

describe( 'container-level action slots', () => {
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

	it( 'feeds AgentUI.Input from the container when it gets no slot props', async () => {
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					variant="embedded"
					inputValue="hello"
					onInputChange={ () => {} }
					leadingActions={ <span data-testid="lead" /> }
					trailingActions={ <span data-testid="trail" /> }
				>
					<AgentUIInput />
				</AgentUIContainer>
			);
		} );
		expect( rowOrder( container ) ).toEqual( [ 'lead', 'trail', 'Send message' ] );
	} );

	it( 'lets AgentUI.Input props override the container slots', async () => {
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					variant="embedded"
					inputValue="hello"
					onInputChange={ () => {} }
					trailingActions={ <span data-testid="from-container" /> }
				>
					<AgentUIInput trailingActions={ <span data-testid="from-input" /> } />
				</AgentUIContainer>
			);
		} );
		expect( rowOrder( container ) ).toEqual( [ 'from-input', 'Send message' ] );
	} );

	it( 'renders the slots in the floating compact view', async () => {
		await act( async () => {
			root.render(
				<AgentUIContainer
					messages={ [] }
					isProcessing={ false }
					onSubmit={ () => {} }
					variant="floating"
					floatingChatState="compact"
					inputValue="hello"
					onInputChange={ () => {} }
					leadingActions={ <span data-testid="lead" /> }
					trailingActions={ <span data-testid="trail" /> }
				>
					<div>expanded content</div>
				</AgentUIContainer>
			);
		} );
		expect( rowOrder( container ) ).toEqual( [ 'lead', 'trail', 'Send message' ] );
	} );
} );
