/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DASHBOARD_SITES_QUERY_KEY } from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import wpcom from 'calypso/lib/wp';
import agencyReducer from 'calypso/state/a8c-for-agencies/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ImportFromWPCOMModal from '..';

jest.mock( 'calypso/lib/wp', () => ( { req: { post: jest.fn() } } ) );
jest.mock( 'calypso/a8c-for-agencies/hooks/use-minimize-help-center-on-mount', () => jest.fn() );
jest.mock(
	'../wpcom-sites-table',
	() =>
		function MockWPCOMSitesTable( {
			setSelectedSites,
		}: {
			setSelectedSites: ( blogIds: number[] ) => void;
		} ) {
			return <button onClick={ () => setSelectedSites( [ 42 ] ) }>Select site</button>;
		}
);

const mockPost = wpcom.req.post as jest.Mock;

function renderModal( onClose = jest.fn() ) {
	const queryClient = new QueryClient();
	const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );

	renderWithProvider( <ImportFromWPCOMModal onClose={ onClose } />, {
		queryClient,
		reducers: { a8cForAgencies: agencyReducer },
		initialState: {
			a8cForAgencies: { agencies: { isFetching: false, activeAgency: { id: 123 } } },
		},
	} );

	return { invalidateQueries, onClose };
}

async function addSelectedSite() {
	await userEvent.click( screen.getByRole( 'button', { name: 'Select site' } ) );
	await userEvent.click( screen.getByRole( 'button', { name: 'Add 1 site' } ) );
}

describe( 'ImportFromWPCOMModal', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'refreshes the sites dashboard after a successful import', async () => {
		mockPost.mockResolvedValue( { success: true } );
		const { invalidateQueries, onClose } = renderModal();

		await addSelectedSite();

		await waitFor( () => expect( onClose ).toHaveBeenCalled(), { timeout: 2000 } );
		expect( invalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ DASHBOARD_SITES_QUERY_KEY ],
		} );
	} );

	test( 'does not refresh the sites dashboard when the import fails', async () => {
		mockPost.mockRejectedValue( new Error( 'Import failed' ) );
		const { invalidateQueries, onClose } = renderModal();

		await addSelectedSite();

		await waitFor( () => expect( mockPost ).toHaveBeenCalled() );
		await new Promise( ( resolve ) => setTimeout( resolve, 1100 ) );
		expect( invalidateQueries ).not.toHaveBeenCalled();
		expect( onClose ).not.toHaveBeenCalled();
	} );
} );
