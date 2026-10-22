/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaygroundIframe } from '../components/playground-iframe';
import { initializeWordPressPlayground } from '../lib/initialize-playground';

jest.mock( '../lib/initialize-playground' );
jest.mock( 'calypso/data/php-versions', () => ( {
	getPHPVersions: () => ( { recommendedValue: '8.3' } ),
} ) );

let mockSearchParams: URLSearchParams;
const mockSetSearchParams = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	useSearchParams: () => [ mockSearchParams, mockSetSearchParams ],
} ) );

describe( 'PlaygroundIframe acquisition retry', () => {
	const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' )!;
	const reload = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { href: 'http://localhost/', reload },
		} );
		jest
			.mocked( initializeWordPressPlayground )
			.mockRejectedValue( new TypeError( 'Failed to fetch dynamically imported module' ) );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', locationDescriptor );
	} );

	it.each( [ null, 'saved-site-id' ] )(
		'reloads the current document without changing parameters for playground ID %s',
		async ( playgroundId ) => {
			mockSearchParams = new URLSearchParams( {
				blueprint: '123',
				'blueprint-url': 'https://example.com/synthetic-blueprint.json',
				intent: 'build',
			} );
			if ( playgroundId ) {
				mockSearchParams.set( 'playground', playgroundId );
			}
			const href = `http://localhost/setup/onboarding/playground?${ mockSearchParams }#preview`;
			window.location.href = href;
			const paramsBefore = mockSearchParams.toString();
			const setPlaygroundClient = jest.fn();

			render(
				<PlaygroundIframe
					hasPlaygroundClient={ false }
					setPlaygroundClient={ setPlaygroundClient }
				/>
			);

			const retry = await screen.findByRole( 'button', { name: 'Try again' } );
			expect( retry ).toBeVisible();
			expect( reload ).not.toHaveBeenCalled();
			await userEvent.click( retry );

			expect( reload ).toHaveBeenCalledTimes( 1 );
			expect( window.location.href ).toBe( href );
			expect( mockSearchParams.toString() ).toBe( paramsBefore );
			expect( mockSetSearchParams ).not.toHaveBeenCalled();
			expect( setPlaygroundClient ).not.toHaveBeenCalled();
			expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 1 );
		}
	);
} );
