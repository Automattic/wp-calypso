/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { Component, Suspense } from '@wordpress/element';
import lazyComponent, { lazyWithRetry } from '../lazy-component';

// The failure paths wait on the helper's real retry delay, so they need more
// than Testing Library's default timeout.
const RETRY_TIMEOUT = { timeout: 3000 };

describe( 'lazyComponent', () => {
	it( 'renders the loaded component', async () => {
		const Lazy = lazyComponent( () =>
			Promise.resolve( { default: () => <div>Loaded content</div> } )
		);

		render( <Lazy /> );

		expect( await screen.findByText( 'Loaded content' ) ).toBeVisible();
	} );

	it( 'retries once, so a transient chunk failure still renders', async () => {
		let attempt = 0;
		const Lazy = lazyComponent( () => {
			attempt++;
			return attempt === 1
				? Promise.reject( new Error( 'Chunk failed.' ) )
				: Promise.resolve( { default: () => <div>Loaded after retry</div> } );
		} );

		render( <Lazy /> );

		expect(
			await screen.findByText( 'Loaded after retry', undefined, RETRY_TIMEOUT )
		).toBeVisible();
	} );

	it( 'renders nothing and logs when the chunk fails to load', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const Lazy = lazyComponent( () => Promise.reject( new Error( 'Chunk failed.' ) ) );

		const { container } = render( <Lazy /> );

		await waitFor(
			() =>
				expect( error ).toHaveBeenCalledWith(
					'[AgentsManager] Failed to load a chat component:',
					expect.any( Error )
				),
			RETRY_TIMEOUT
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );

describe( 'lazyWithRetry', () => {
	class Boundary extends Component< { children: React.ReactNode }, { error?: Error } > {
		state: { error?: Error } = {};

		static getDerivedStateFromError( error: Error ) {
			return { error };
		}

		render() {
			return this.state.error ? <p>{ this.state.error.message }</p> : this.props.children;
		}
	}

	it( 'throws to the boundary around it when the chunk fails twice', async () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const load = jest.fn( () => Promise.reject( new Error( 'Chunk failed.' ) ) );
		const Lazy = lazyWithRetry( load );

		render(
			<Boundary>
				<Suspense fallback={ null }>
					<Lazy />
				</Suspense>
			</Boundary>
		);

		expect( await screen.findByText( 'Chunk failed.', undefined, RETRY_TIMEOUT ) ).toBeVisible();
		expect( load ).toHaveBeenCalledTimes( 2 );

		consoleError.mockRestore();
	} );
} );
