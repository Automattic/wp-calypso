/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { RedirectToStep } from '../';

jest.mock( 'calypso/state/current-user/selectors' );

const LocationDisplay = () => {
	const location = useLocation();
	return (
		<>
			<div data-testid="location-display">{ location.pathname + location.search }</div>
		</>
	);
};

const render = ( { currentPath, stepToRedirect } ) => {
	return renderWithProvider(
		<MemoryRouter basename="/setup" initialEntries={ [ currentPath ] }>
			<Routes>
				<Route path={ `/:flow/${ stepToRedirect }/:lang?` } element={ <div>Flow</div> } />
				<Route path="/:flow/:step/:lang?" element={ <RedirectToStep slug={ stepToRedirect } /> } />
			</Routes>
			<LocationDisplay />
		</MemoryRouter>
	);
};

describe( 'RedirectToStep', () => {
	it( 'redirects to the step', () => {
		render( { currentPath: '/setup/flow-name/old-step', stepToRedirect: 'new-step' } );

		setTimeout( () => {
			expect( screen.getByText( '/flow-name/new-step' ) ).toBeInTheDocument();
		}, 0 );
	} );

	it( 'redirects to the step using the specified language', () => {
		render( { currentPath: '/setup/flow-name/old-step/es', stepToRedirect: 'new-step' } );

		setTimeout( () => {
			expect( screen.getByText( '/flow-name/new-step/es' ) ).toBeInTheDocument();
		}, 0 );
	} );

	it( 'ignores the url language if the user is logged in', () => {
		( isUserLoggedIn as jest.Mock ).mockReturnValue( true );

		render( { currentPath: '/setup/flow-name/old-step/es', stepToRedirect: 'new-step' } );

		setTimeout( () => {
			expect( screen.getByText( '/flow-name/new-step' ) ).toBeInTheDocument();
		}, 0 );
	} );
} );
