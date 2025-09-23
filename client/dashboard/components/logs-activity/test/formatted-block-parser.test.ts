import parseActivityContent, { type ActivityBlockContent } from '../formatted-block-parser';

describe( 'parseActivityContent', () => {
	test( 'returns an empty array when content is undefined', () => {
		expect( parseActivityContent() ).toEqual( [] );
	} );
	test( 'wraps string content in an array', () => {
		expect( parseActivityContent( 'text' ) ).toEqual( [ 'text' ] );
	} );

	test( 'returns items verbatim when provided', () => {
		const items: ActivityBlockContent[] = [
			'text',
			{ type: 'b', text: 'bold', children: [ 'bold' ] },
		];
		expect( parseActivityContent( { text: 'ignored', items } ) ).toEqual( items );
	} );

	test( 'parses ranges into block nodes and surrounding text', () => {
		const content = {
			text: 'View post',
			ranges: [
				{
					id: 'link',
					indices: [ 0, 4 ] as [ number, number ],
					type: 'link',
					url: 'https://wordpress.com/posts/slug',
				},
			],
		};

		const result = parseActivityContent( content );

		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ] ).toMatchObject( {
			type: 'link',
			text: 'View',
			url: 'https://wordpress.com/posts/slug',
			children: [ 'View' ],
		} );
		expect( result[ 1 ] ).toBe( ' post' );
	} );

	test( 'nests child ranges within parent ranges', () => {
		const content = {
			text: 'Hello world',
			ranges: [
				{
					id: 'link',
					indices: [ 0, 11 ] as [ number, number ],
					type: 'link',
					url: 'https://example.com',
				},
				{
					id: 'bold',
					indices: [ 6, 11 ] as [ number, number ],
					type: 'b',
				},
			],
		};

		const result = parseActivityContent( content );
		const linkNode = result[ 0 ] as { children?: ActivityBlockContent[] };

		expect( Array.isArray( linkNode.children ) ).toBe( true );
		expect( linkNode ).toMatchObject( {
			type: 'link',
			text: 'Hello world',
			url: 'https://example.com',
		} );
		expect( linkNode.children?.[ 0 ] ).toBe( 'Hello ' );
		expect( linkNode.children?.[ 1 ] ).toMatchObject( {
			type: 'b',
			text: 'world',
			children: [ 'world' ],
		} );
	} );
} );
