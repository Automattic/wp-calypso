/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AddNewSite from '../add-new-site';

jest.mock( 'calypso/lib/paths/use-add-new-site-url', () => ( {
	useAddNewSiteUrl: () => '/start',
} ) );

const renderWithUser = ( user ) =>
	renderWithProvider( <AddNewSite title="Add new site" />, {
		initialState: { currentUser: { id: user?.ID ?? null, user, capabilities: {} } },
	} );

describe( '<AddNewSite />', () => {
	test( 'renders the link when the user has one site', () => {
		renderWithUser( { ID: 1, visible_site_count: 1 } );

		expect( screen.getByRole( 'link', { name: 'Add new site' } ) ).toBeVisible();
	} );

	test( 'renders nothing when the user has more than one site', () => {
		renderWithUser( { ID: 1, visible_site_count: 2 } );

		expect( screen.queryByRole( 'link', { name: 'Add new site' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not crash when there is no current user', () => {
		renderWithUser( null );

		expect( screen.getByRole( 'link', { name: 'Add new site' } ) ).toBeVisible();
	} );
} );
