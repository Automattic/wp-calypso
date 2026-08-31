import { getRichNodes } from '../rich-text';
import type { Block } from '../types';

const block = ( partial: Partial< Block > ): Block => ( { text: '', ...partial } );

describe( 'getRichNodes', () => {
	it( 'returns plain text without spans', () => {
		expect( getRichNodes( block( { text: 'Hello' } ) ) ).toEqual( [
			{ kind: 'text', text: 'Hello' },
		] );
	} );

	it( 'nests contained ranges and keeps surrounding text', () => {
		const nodes = getRichNodes(
			block( {
				text: 'Go update your settings now.',
				ranges: [
					{ type: 'link', indices: [ 3, 27 ], url: 'https://a.example', id: 1, parent: null },
					{ type: 'b', indices: [ 15, 23 ], id: 2, parent: 1 },
				],
			} )
		);
		expect( nodes ).toEqual( [
			{ kind: 'text', text: 'Go ' },
			{
				kind: 'element',
				type: 'link',
				url: 'https://a.example',
				children: [
					{ kind: 'text', text: 'update your ' },
					{
						kind: 'element',
						type: 'b',
						url: undefined,
						children: [ { kind: 'text', text: 'settings' } ],
					},
					{ kind: 'text', text: ' now' },
				],
			},
			{ kind: 'text', text: '.' },
		] );
	} );

	it( 'renders media as image nodes with the covered text as alt', () => {
		const nodes = getRichNodes(
			block( {
				text: 'screenshot',
				media: [ { type: 'image', indices: [ 0, 10 ], url: 'https://img.example/a.png' } ],
			} )
		);
		expect( nodes ).toEqual( [
			{
				kind: 'image',
				imageType: 'image',
				url: 'https://img.example/a.png',
				alt: 'screenshot',
				width: undefined,
				height: undefined,
			},
		] );
	} );

	it( 'puts zero-length icon spans before content at the same position', () => {
		const nodes = getRichNodes(
			block( {
				text: 'You replied to this.',
				ranges: [
					{ type: 'noticon', indices: [ 0, 0 ], value: 'comment', id: 1, parent: null },
					{ type: 'link', indices: [ 0, 20 ], url: 'https://c.example', id: 2, parent: null },
				],
			} )
		);
		expect( nodes[ 0 ] ).toEqual( { kind: 'icon', value: 'comment' } );
		expect( nodes[ 1 ] ).toMatchObject( { kind: 'element', type: 'link' } );
	} );

	it( 'drops spans that overlap a consumed area', () => {
		const nodes = getRichNodes(
			block( {
				text: 'abcdef',
				ranges: [
					{ type: 'link', indices: [ 0, 4 ], url: 'https://a.example', id: 1, parent: null },
					{ type: 'link', indices: [ 2, 6 ], url: 'https://b.example', id: 2, parent: null },
				],
			} )
		);
		expect( nodes ).toEqual( [
			{
				kind: 'element',
				type: 'link',
				url: 'https://a.example',
				children: [ { kind: 'text', text: 'abcd' } ],
			},
			{ kind: 'text', text: 'ef' },
		] );
	} );

	it( 'nests an image inside the link declared around it', () => {
		const nodes = getRichNodes( {
			text: '',
			ranges: [ { type: 'link', indices: [ 0, 0 ], id: 1, parent: null, url: 'https://ex.test' } ],
			media: [
				{ type: 'image', indices: [ 0, 0 ], id: 2, parent: 1, url: 'https://ex.test/i.png' },
			],
		} );

		expect( nodes ).toEqual( [
			{
				kind: 'element',
				type: 'link',
				url: 'https://ex.test',
				children: [
					{
						kind: 'image',
						imageType: 'image',
						url: 'https://ex.test/i.png',
						alt: '',
						width: undefined,
						height: undefined,
					},
				],
			},
		] );
	} );

	it( 'nests an image inside a link that also covers text', () => {
		const nodes = getRichNodes( {
			text: 'See it',
			ranges: [ { type: 'link', indices: [ 0, 6 ], id: 1, parent: null, url: 'https://ex.test' } ],
			media: [
				{ type: 'image', indices: [ 6, 6 ], id: 2, parent: 1, url: 'https://ex.test/i.png' },
			],
		} );

		expect( nodes ).toHaveLength( 1 );
		const link = nodes[ 0 ];
		expect( link.kind ).toBe( 'element' );
		expect( link.kind === 'element' && link.children.some( ( c ) => c.kind === 'image' ) ).toBe(
			true
		);
	} );
} );
