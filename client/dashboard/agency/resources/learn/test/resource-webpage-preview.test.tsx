/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResourceWebpagePreview from '../resource-webpage-preview';

beforeEach( () => jest.useFakeTimers() );
afterEach( () => jest.useRealTimers() );

test( 'an initial blank load stays pending and a stalled preview can be retried', async () => {
	const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
	render( <ResourceWebpagePreview title="Resource" url="https://example.com/guide" /> );
	const iframe = screen.getByTitle( 'Resource' );
	Object.defineProperty( iframe, 'contentDocument', {
		value: { URL: 'about:blank' },
		configurable: true,
	} );
	fireEvent.load( iframe );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Loading preview' );
	act( () => jest.advanceTimersByTime( 8000 ) );
	await user.click( screen.getByRole( 'button', { name: 'Retry preview' } ) );
	expect( screen.getByTitle( 'Resource' ) ).not.toBe( iframe );
	expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Loading preview' );

	// Cross-origin documents are inaccessible once navigation completes.
	Object.defineProperty( screen.getByTitle( 'Resource' ), 'contentDocument', { value: null } );
	fireEvent.load( screen.getByTitle( 'Resource' ) );
	expect( screen.queryByRole( 'status' ) ).toBeNull();
	expect( screen.getByTitle( 'Resource' ) ).toBeVisible();
} );
