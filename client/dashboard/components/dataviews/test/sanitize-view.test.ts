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

	it( 'should keep view unchanged when valid', () => {
		const sanitizedView = sanitizeView( validView, fields );
		expect( sanitizedView ).toEqual( validView );
	} );

	it( 'should remove sort when field is not sortable', () => {
		const view: View = {
			...validView,
			sort: { field: 'is_deleted', direction: 'asc' },
		};

		const sanitizedView = sanitizeView( view, fields );
		expect( sanitizedView ).toEqual( { ...validView, sort: undefined } );
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
