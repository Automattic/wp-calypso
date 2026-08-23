/**
 * @jest-environment jsdom
 */

import { getFetchPaginatedSitesOptions } from '../index';
import type { View } from '@wordpress/dataviews';

jest.mock( '../../utils/is-dashboard-backport', () => ( {
	isDashboardBackport: jest.fn( () => false ),
} ) );

const { isDashboardBackport } = jest.requireMock( '../../utils/is-dashboard-backport' );

const queryOptions = { isDefaultView: true, isRestoringAccount: false, isAutomattician: false };

function makeView( filters: View[ 'filters' ] = [] ): View {
	return { type: 'table', filters } as View;
}

describe( 'getFetchPaginatedSitesOptions', () => {
	beforeEach( () => {
		isDashboardBackport.mockReturnValue( false );
	} );

	it( 'excludes staging sites by default', () => {
		const options = getFetchPaginatedSitesOptions( makeView(), queryOptions );
		expect( options.include_staging ).toBe( false );
	} );

	it( 'includes staging sites when the staging filter is set to show', () => {
		const view = makeView( [ { field: 'staging', operator: 'is', value: true } ] );
		const options = getFetchPaginatedSitesOptions( view, queryOptions );
		expect( options.include_staging ).toBe( true );
	} );

	it( 'excludes staging sites when the staging filter is set to hide', () => {
		const view = makeView( [ { field: 'staging', operator: 'is', value: false } ] );
		const options = getFetchPaginatedSitesOptions( view, queryOptions );
		expect( options.include_staging ).toBe( false );
	} );

	it( 'leaves the API default in the classic Calypso backport', () => {
		isDashboardBackport.mockReturnValue( true );
		const options = getFetchPaginatedSitesOptions( makeView(), queryOptions );
		expect( options ).not.toHaveProperty( 'include_staging' );
	} );
} );
