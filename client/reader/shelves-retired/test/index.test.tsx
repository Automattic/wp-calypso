/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn() },
} ) );

import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShelvesRetiredModal } from '..';
import { SHELVES_RETIRED_PATH } from '../constants';

describe( 'ShelvesRetiredModal', () => {
	beforeEach( () => {
		jest.mocked( page.replace ).mockReset();
	} );

	it( 'renders nothing on a regular Reader visit', () => {
		window.history.replaceState( null, '', '/reader' );
		render( <ShelvesRetiredModal /> );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'explains that Shelves has been retired after a redirect from an old shelf link', () => {
		window.history.replaceState( null, '', SHELVES_RETIRED_PATH );
		render( <ShelvesRetiredModal /> );
		expect( screen.getByRole( 'dialog', { name: 'Shelves have been retired' } ) ).toBeVisible();
	} );

	it( 'closes and drops the query arg without re-dispatching the route', async () => {
		const user = userEvent.setup();
		window.history.replaceState( null, '', `${ SHELVES_RETIRED_PATH }&at=2026-11-01` );
		render( <ShelvesRetiredModal /> );

		await user.click( screen.getByRole( 'button', { name: 'Got it' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( page.replace ).toHaveBeenCalledWith( '/reader?at=2026-11-01', null, false, false );
	} );
} );
