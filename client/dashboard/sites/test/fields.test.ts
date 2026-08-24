/**
 * @jest-environment jsdom
 */

import { APP_CONTEXT_DEFAULT_CONFIG } from '../../app/context';
import { getDefaultFields } from '../dataviews/fields';

function getDeletedField() {
	const fields = getDefaultFields( {
		viewType: 'table',
		queries: APP_CONTEXT_DEFAULT_CONFIG.queries,
	} );
	return fields.find( ( field ) => field.id === 'is_deleted' );
}

describe( 'the deleted sites field', () => {
	test( 'can be sorted so deleted sites can be grouped in the list', () => {
		expect( getDeletedField()?.enableSorting ).toBe( true );
	} );
} );
