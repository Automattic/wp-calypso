/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import lazyComponent from '../lazy-component';

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
