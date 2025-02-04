import { parseQueryStringProducts, serializeQueryStringProducts } from '../querystring-products';

describe( 'parseQueryStringProducts', () => {
	it( 'returns the correct product slug', () => {
		const [ item ] = parseQueryStringProducts( 'myslug:1' );
		expect( item.slug ).toBe( 'myslug' );
	} );

	it( 'correctly recognizes quantities when present', () => {
		const [ item ] = parseQueryStringProducts( 'my-other-slug:5' );
		expect( item.quantity ).toBe( 5 );
	} );

	it( 'assumes a quantity of 1 when no quantity is specified', () => {
		const [ item ] = parseQueryStringProducts( 'this_is_a_test' );
		expect( item.quantity ).toBe( 1 );
	} );

	it( 'can parse multiple products', () => {
		const result = parseQueryStringProducts( 'item:1,otheritem:2,thirditem:4' );
		expect( result.length ).toBe( 3 );

		const [ first, second, third ] = result;
		expect( first.slug ).toBe( 'item' );
		expect( first.quantity ).toBe( 1 );

		expect( second.slug ).toBe( 'otheritem' );
		expect( second.quantity ).toBe( 2 );

		expect( third.slug ).toBe( 'thirditem' );
		expect( third.quantity ).toBe( 4 );
	} );

	it( 'returns an empty list when the input is not a string', () => {
		const result = parseQueryStringProducts( null );
		expect( result ).toEqual( [] );
	} );
} );

describe( 'serializeQueryStringProducts', () => {
	it( 'separates individual products with a comma', () => {
		const products = [
			{ slug: 'first', quantity: 1 },
			{ slug: 'second', quantity: 1 },
		];

		const result = serializeQueryStringProducts( products );
		expect( result.split( ',' ).length ).toBe( 2 );
	} );

	it( 'formats individual products as slug:quantity', () => {
		const result = serializeQueryStringProducts( [ { slug: 'my_item', quantity: 4 } ] );
		expect( result ).toBe( 'my_item:4' );
	} );
} );
