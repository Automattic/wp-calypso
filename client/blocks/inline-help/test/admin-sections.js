/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { filterListBySearchTerm } from 'blocks/inline-help/admin-sections';

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
		const result = filterListBySearchTerm( "<$(*&#\\\\\\'''''>", mockCollection );
		expect( result ).to.deep.equal( [] );
	} );

	test( 'should return `[]` for no matches', () => {
		const result = filterListBySearchTerm( 'ciao', mockCollection );
		expect( result ).to.deep.equal( [] );
	} );

	test( 'should return a direct match', () => {
		const result = filterListBySearchTerm( 'The best section', mockCollection );
		expect( result ).to.deep.equal( [
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
		const result = filterListBySearchTerm( 'best section', mockCollection );
		expect( result ).to.deep.equal( [
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
		const result = filterListBySearchTerm( 'yolo', mockCollection );
		expect( result ).to.deep.equal( [
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
