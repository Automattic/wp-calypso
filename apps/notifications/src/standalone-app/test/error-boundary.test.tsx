/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { captureException } from '../../lib/sentry';
import ErrorBoundary from '../error-boundary';

jest.mock( '../../lib/sentry', () => ( {
	captureException: jest.fn(),
} ) );

const Boom = () => {
	throw new Error( 'render crash' );
};

describe( 'notifications ErrorBoundary', () => {
	it( 'renders children when there is no error', () => {
		render(
			<ErrorBoundary>
				<div>child content</div>
			</ErrorBoundary>
		);
		expect( screen.getByText( 'child content' ) ).toBeTruthy();
	} );

	it( 'shows the fallback and reports a render crash', () => {
		// React logs caught render errors to console.error; silence it.
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		render(
			<ErrorBoundary>
				<Boom />
			</ErrorBoundary>
		);

		expect( screen.getByText( 'Notifications couldn’t load.' ) ).toBeTruthy();
		expect( captureException ).toHaveBeenCalledWith( expect.any( Error ), expect.any( Object ) );

		consoleError.mockRestore();
	} );
} );
