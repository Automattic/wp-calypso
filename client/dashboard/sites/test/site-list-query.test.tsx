/**
 * @jest-environment jsdom
 */

import { waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../test-utils';
import { useSiteListQuery } from '../index';
import type { Operator, View } from '@wordpress/dataviews';

const baseOptions = {
	isDefaultView: false,
	isRestoringAccount: false,
	isAutomattician: false,
};

function captureSitesRequest() {
	const query: Record< string, string > = {};
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.3/me/sites' )
		.query( ( actual ) => {
			Object.assign( query, actual );
			return true;
		} )
		.reply( 200, { sites: [], total: 0 } );
	return query;
}

function SiteListQueryProbe( { view }: { view: View } ) {
	useSiteListQuery( view, baseOptions );
	return null;
}

function renderWithFilters( filters: View[ 'filters' ] ) {
	const query = captureSitesRequest();
	render( <SiteListQueryProbe view={ { type: 'table', filters } as View } /> );
	return query;
}

const deletedFilter = [ { field: 'is_deleted', operator: 'is' as Operator, value: true } ];

describe( 'the sites list request', () => {
	test( 'asks for visible sites only when the deleted filter is off', async () => {
		const query = renderWithFilters( [] );

		await waitFor( () => expect( query.site_visibility ).toBe( 'visible' ) );
	} );

	test( 'asks for deleted sites alongside live ones when the deleted filter is on', async () => {
		const query = renderWithFilters( deletedFilter );

		await waitFor( () => expect( query.site_visibility ).toBe( 'all' ) );
	} );
} );
