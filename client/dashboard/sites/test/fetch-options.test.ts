/**
 * @jest-environment jsdom
 */

import { getFetchPaginatedSitesOptions } from '../index';
import type { View } from '@wordpress/dataviews';

const queryOptions = { isDefaultView: true, isRestoringAccount: false, isAutomattician: false };

function makeView( filters: View[ 'filters' ] = [] ): View {
	return { type: 'table', filters } as View;
}

describe( 'getFetchPaginatedSitesOptions', () => {
	it( 'excludes staging sites by default', () => {
		const options = getFetchPaginatedSitesOptions( makeView(), queryOptions );
		expect( options.include_staging ).toBe( false );
	} );

	it( 'includes staging sites when the staging filter is set to yes', () => {
		const view = makeView( [ { field: 'staging', operator: 'is', value: true } ] );
		const options = getFetchPaginatedSitesOptions( view, queryOptions );
		expect( options.include_staging ).toBe( true );
	} );

	it( 'excludes staging sites when the staging filter is set to no', () => {
		const view = makeView( [ { field: 'staging', operator: 'is', value: false } ] );
		const options = getFetchPaginatedSitesOptions( view, queryOptions );
		expect( options.include_staging ).toBe( false );
	} );
} );
