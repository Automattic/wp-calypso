/**
 * @jest-environment jsdom
 */

import { sanitizeView } from '../sanitize-view';
import type { Field, View } from '@wordpress/dataviews';

describe( 'sanitizeView', () => {
	const fields: Field< any >[] = [
		{ id: 'name', enableSorting: true },
		{ id: 'is_deleted', enableSorting: false },
		{ id: 'visibility', enableSorting: true },
		{ id: 'plan', enableSorting: true },
	];

	const validView: View = {
		type: 'table',
		sort: { field: 'name', direction: 'asc' },
		filters: [
			{ field: 'is_deleted', operator: 'is', value: true },
			{ field: 'visibility', operator: 'isAny', value: [ 'public', 'private' ] },
			{ field: 'plan', operator: 'isAny', value: undefined },
		],
	};

	it( 'should keep the same view when its layout is available', () => {
		const view: View = { type: 'table', layout: { density: 'compact' } };

		expect( sanitizeView( view, fields, { table: {}, grid: {} } ) ).toBe( view );
	} );

	it( 'should keep the same view when the screen does not name its layouts', () => {
		const view: View = { type: 'grid' };

		expect( sanitizeView( view, fields ) ).toBe( view );
	} );

	it( 'should move a view to the first layout when its own is not available', () => {
		const view: View = {
			...validView,
			type: 'grid',
			layout: { previewSize: 290 },
			perPage: 12,
			search: 'example',
		};

		expect(
			sanitizeView( view, fields, {
				table: { layout: { density: 'balanced' }, showMedia: false },
				list: {},
			} )
		).toEqual( {
			...validView,
			type: 'table',
			layout: { density: 'balanced' },
			showMedia: false,
			perPage: 12,
			search: 'example',
		} );
	} );

	it( 'should accept `true` as a layout’s configuration', () => {
		const view: View = { type: 'grid', layout: { previewSize: 290 } };

		expect( sanitizeView( view, fields, { table: true } ) ).toEqual( { type: 'table' } );
	} );

	it( 'should keep view unchanged when valid', () => {
		const sanitizedView = sanitizeView( validView, fields );
		expect( sanitizedView ).toEqual( validView );
	} );

	it( 'should remove filter with "is" operator and non-scalar value', () => {
		const view: View = {
			...validView,
			filters: [
				{ field: 'is_deleted', operator: 'is', value: [ true ] },
				{ field: 'visibility', operator: 'isAny', value: [ 'public', 'private' ] },
			],
		};

		const sanitizedView = sanitizeView( view, fields );
		expect( sanitizedView ).toEqual( {
			...validView,
			filters: [ { field: 'visibility', operator: 'isAny', value: [ 'public', 'private' ] } ],
		} );
	} );

	it( 'should remove filter with "isAny" operator and non-array value', () => {
		const view: View = {
			...validView,
			filters: [
				{ field: 'is_deleted', operator: 'is', value: true },
				{ field: 'visibility', operator: 'isAny', value: 'public' },
			],
		};

		const sanitizedView = sanitizeView( view, fields );
		expect( sanitizedView ).toEqual( {
			...validView,
			filters: [ { field: 'is_deleted', operator: 'is', value: true } ],
		} );
	} );
} );
