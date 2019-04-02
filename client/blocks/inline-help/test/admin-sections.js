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

import * as adminSectionsMethods from '../admin-sections';

describe( 'Admin section search and filters', () => {
	describe( 'getAdminSectionsResults()', () => {
		test( 'should return `[]` when there is no search term', () => {
			const result = adminSectionsMethods.getAdminSectionsResults();
			expect( result ).toEqual( [] );
		} );
	} );

	describe( 'filterListBySearchTerm()', () => {
		const mockCollection = [
			{
				title: 'The best section',
				description: 'Better than that other section.',
				link: `/best/section/eva`,
				synonyms: [ 'yolo', 'gud' ],
				icon: 'beta',
			},
			{
				title: 'Quite a good page',
				description: 'A rather agreeable page if you ask me.',
				link: `/acceptable/page`,
				synonyms: [ 'hi', 'bye' ],
				icon: 'gamma',
			},
		];

		test( 'should ignore non-word characters and return `[]`', () => {
			const result = adminSectionsMethods.filterListBySearchTerm(
				"<$(*&#\\\\\\'''''>",
				mockCollection
			);
			expect( result ).toEqual( [] );
		} );

		test( 'should return `[]` for no matches', () => {
			const result = adminSectionsMethods.filterListBySearchTerm( 'ciao', mockCollection );
			expect( result ).toEqual( [] );
		} );

		test( 'should return a direct match', () => {
			const result = adminSectionsMethods.filterListBySearchTerm(
				'The best section',
				mockCollection
			);
			expect( result ).toEqual( [
				{
					description: 'Better than that other section.',
					icon: 'beta',
					key: 'The best section',
					link: '/best/section/eva',
					synonyms: [ 'yolo', 'gud' ],
					title: 'The best section',
					type: 'internal',
				},
			] );
		} );

		test( 'should return a partial match', () => {
			const result = adminSectionsMethods.filterListBySearchTerm( 'best section', mockCollection );
			expect( result ).toEqual( [
				{
					description: 'Better than that other section.',
					icon: 'beta',
					key: 'The best section',
					link: '/best/section/eva',
					synonyms: [ 'yolo', 'gud' ],
					title: 'The best section',
					type: 'internal',
				},
			] );
		} );

		test( 'should return a synonym match', () => {
			const result = adminSectionsMethods.filterListBySearchTerm( 'yolo', mockCollection );
			expect( result ).toEqual( [
				{
					description: 'Better than that other section.',
					icon: 'beta',
					key: 'The best section',
					link: '/best/section/eva',
					synonyms: [ 'yolo', 'gud' ],
					title: 'The best section',
					type: 'internal',
				},
			] );
		} );
	} );
} );
