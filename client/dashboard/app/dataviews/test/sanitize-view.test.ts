/**
 * @jest-environment jsdom
 */

import { sanitizeView } from '../sanitize-view';
import type { Field, View } from '@wordpress/dataviews';

describe( 'sanitizeView', () => {
	it( 'should sanitize the view', async () => {
		const fields: Field< any >[] = [
			{ id: 'name', enableSorting: true },
			{ id: 'date', enableSorting: false },
		];

		const view: View = {
			type: 'grid',

			// invalid preview size
			layout: { previewSize: 100 },

			// non-sortable field
			sort: { field: 'date', direction: 'asc' },
		};

		const sanitizedView = sanitizeView( view, fields );
		expect( sanitizedView ).toEqual( {
			type: 'grid',
			layout: {},
		} );
	} );
} );
