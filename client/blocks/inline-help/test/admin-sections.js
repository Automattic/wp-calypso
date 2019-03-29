/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import { filterListBySearchTerm } from '../admin-sections';

describe( 'Admin section search and filters', () => {
	describe( 'filterListBySearchTerm()', () => {
		const mockCollection = [
			{
				title: 'The best section',
				description: 'Better than that other section.',
				link: `/best/section/eva`,
				synonyms: [ 'yolo', 'gud' ],
			},
		];
		test( 'should ignore non-word characters', () => {
			const result = filterListBySearchTerm( "<$(*&#\\\\\\'''''>", mockCollection );
			expect( result ).toBeUndefined();
		} );
	} );
} );
