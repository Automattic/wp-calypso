/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import agencyReducer from 'calypso/state/a8c-for-agencies/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import WPCOMSitesTable from '../wpcom-sites-table';

jest.mock( 'calypso/data/agency-dashboard/use-fetch-dashboard-sites', () =>
	jest.fn( () => ( { data: { total: 0, sites: [] }, isPending: false } ) )
);
jest.mock( '@automattic/viewport-react', () => ( {
	...jest.requireActual( '@automattic/viewport-react' ),
	useDesktopBreakpoint: () => true,
} ) );

const makeSite = ( ID: number, name: string, URL: string ) => ( {
	ID,
	name,
	URL,
	jetpack: true,
	options: { created_at: '2024-01-01T00:00:00+00:00' },
} );

function renderTable() {
	return renderWithProvider(
		<WPCOMSitesTable selectedSites={ [] } setSelectedSites={ jest.fn() } />,
		{
			reducers: { a8cForAgencies: agencyReducer },
			initialState: {
				a8cForAgencies: { agencies: { isFetching: false, activeAgency: { id: 123 } } },
				sites: {
					items: {
						1: makeSite( 1, 'Bakery Shop', 'https://sweetcrumbs.example' ),
						2: makeSite( 2, 'Law Firm', 'https://legaleagles.example' ),
					},
				},
			},
		}
	);
}

describe( 'WPCOMSitesTable search', () => {
	test( 'filters sites by name', async () => {
		renderTable();

		await userEvent.type( screen.getByRole( 'searchbox' ), 'bakery' );

		await waitFor( () =>
			expect( screen.queryByLabelText( 'legaleagles.example' ) ).not.toBeInTheDocument()
		);
		expect( screen.getByLabelText( 'sweetcrumbs.example' ) ).toBeVisible();
	} );

	test( 'filters sites by address', async () => {
		renderTable();

		await userEvent.type( screen.getByRole( 'searchbox' ), 'legaleagles' );

		await waitFor( () =>
			expect( screen.queryByLabelText( 'sweetcrumbs.example' ) ).not.toBeInTheDocument()
		);
		expect( screen.getByLabelText( 'legaleagles.example' ) ).toBeVisible();
	} );

	test( 'shows no sites when nothing matches', async () => {
		renderTable();

		await userEvent.type( screen.getByRole( 'searchbox' ), 'nomatch' );

		await waitFor( () =>
			expect( screen.queryByLabelText( 'sweetcrumbs.example' ) ).not.toBeInTheDocument()
		);
		expect( screen.queryByLabelText( 'legaleagles.example' ) ).not.toBeInTheDocument();
	} );
} );
