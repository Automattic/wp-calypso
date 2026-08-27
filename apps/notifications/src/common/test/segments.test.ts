import { getBlockSegments, getTitleSegments } from '../segments';
import type { Note } from '../types';

const makeNote = ( overrides: Partial< Note > = {} ): Note =>
	( {
		id: 1,
		type: 'comment',
		read: 0,
		timestamp: '2026-08-27T00:00:00+00:00',
		title: 'Fallback title',
		subject: [ { text: 'Subject' } ],
		body: [],
		...overrides,
	} ) as Note;

describe( 'getTitleSegments', () => {
	it( 'bolds the user and post ranges and carries their links', () => {
		const note = makeNote( {
			subject: [
				{
					text: 'Aras mentioned you on Deep links',
					ranges: [
						{
							type: 'user',
							indices: [ 0, 4 ],
							id: 1,
							parent: null,
							url: 'https://example.com/aras',
						},
						{ type: 'post', indices: [ 22, 32 ], id: 2, parent: null },
					],
				},
			],
		} );
		expect( getTitleSegments( note ) ).toEqual( [
			{ text: 'Aras', bold: true, url: 'https://example.com/aras' },
			{ text: ' mentioned you on ', bold: false, url: null },
			{ text: 'Deep links', bold: true, url: null },
		] );
	} );

	it( 'returns one plain segment without ranges', () => {
		expect( getTitleSegments( makeNote( { subject: [ { text: 'Plain' } ] } ) ) ).toEqual( [
			{ text: 'Plain', bold: false, url: null },
		] );
	} );

	it( 'falls back to the note title without a subject block', () => {
		expect( getTitleSegments( makeNote( { subject: [] } ) ) ).toEqual( [
			{ text: 'Fallback title', bold: false, url: null },
		] );
	} );
} );

describe( 'getBlockSegments', () => {
	it( 'splits text into plain and linked segments', () => {
		const segments = getBlockSegments( {
			text: 'New achievement! See all your achievements.',
			ranges: [
				{
					type: 'link',
					indices: [ 17, 42 ],
					url: 'https://wordpress.com/me/achievements',
					id: 1,
					parent: null,
				},
			],
		} );
		expect( segments ).toEqual( [
			{ text: 'New achievement! ' },
			{ text: 'See all your achievements', url: 'https://wordpress.com/me/achievements' },
			{ text: '.' },
		] );
	} );

	it( 'returns the whole text when there are no linkable ranges', () => {
		const segments = getBlockSegments( {
			text: 'Just text',
			ranges: [ { type: 'b', indices: [ 0, 4 ], id: 2, parent: null } ],
		} );
		expect( segments ).toEqual( [ { text: 'Just text' } ] );
	} );

	it( 'drops overlapping and out-of-bounds ranges', () => {
		const segments = getBlockSegments( {
			text: 'abcdef',
			ranges: [
				{ type: 'link', indices: [ 0, 4 ], url: 'https://a.example', id: 3, parent: null },
				{ type: 'link', indices: [ 2, 6 ], url: 'https://b.example', id: 4, parent: null },
				{ type: 'link', indices: [ 5, 9 ], url: 'https://c.example', id: 5, parent: null },
			],
		} );
		expect( segments ).toEqual( [ { text: 'abcd', url: 'https://a.example' }, { text: 'ef' } ] );
	} );
} );
