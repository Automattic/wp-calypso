import { filterListBySearchTerm } from '@automattic/help-center/src/hooks/use-admin-results';

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

	test( 'should ignore non-word characters and return an empty array', () => {
		const result = filterListBySearchTerm( "<$(*&#\\\\\\'''''>", mockCollection );
		expect( result ).toEqual( [] );
	} );

	test( 'should return an empty array for no matches', () => {
		const result = filterListBySearchTerm( 'ciao', mockCollection );
		expect( result ).toEqual( [] );
	} );

	test( 'should return a direct match', () => {
		const result = filterListBySearchTerm( 'The best section', mockCollection );
		expect( result ).toEqual( [
			{
				description: 'Better than that other section.',
				icon: 'beta',
				link: '/best/section/eva',
				synonyms: [ 'yolo', 'gud' ],
				title: 'The best section',
			},
		] );
	} );

	test( 'should return a partial match', () => {
		const result = filterListBySearchTerm( 'best section', mockCollection );
		expect( result ).toEqual( [
			{
				description: 'Better than that other section.',
				icon: 'beta',
				link: '/best/section/eva',
				synonyms: [ 'yolo', 'gud' ],
				title: 'The best section',
			},
		] );
	} );

	test( 'should return a synonym match', () => {
		const result = filterListBySearchTerm( 'yolo', mockCollection );
		expect( result ).toEqual( [
			{
				description: 'Better than that other section.',
				icon: 'beta',
				link: '/best/section/eva',
				synonyms: [ 'yolo', 'gud' ],
				title: 'The best section',
			},
		] );
	} );
} );
