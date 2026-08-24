/**
 * @jest-environment jsdom
 */

import { getFetchPaginatedSitesOptions } from '../index';
import type { Operator, View } from '@wordpress/dataviews';

const baseOptions = {
	isDefaultView: false,
	isRestoringAccount: false,
	isAutomattician: false,
};

function viewWithFilters( filters: View[ 'filters' ] ): View {
	return { type: 'table', filters } as View;
}

const deletedFilter = [ { field: 'is_deleted', operator: 'is' as Operator, value: true } ];

describe( 'getFetchPaginatedSitesOptions', () => {
	test( 'requests visible sites only when the deleted filter is off', () => {
		const options = getFetchPaginatedSitesOptions( viewWithFilters( [] ), baseOptions );

		expect( options.site_visibility ).toBe( 'visible' );
	} );

	test( 'includes deleted sites alongside live ones when the deleted filter is on', () => {
		const options = getFetchPaginatedSitesOptions( viewWithFilters( deletedFilter ), baseOptions );

		expect( options.site_visibility ).toBe( 'all' );
	} );
} );
