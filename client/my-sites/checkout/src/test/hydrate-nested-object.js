import { hydrateNestedObject } from '../lib/contact-validation';

describe( 'hydrateNestedObject', () => {
	it( 'transforms flat object into flat object', () => {
		const actual = hydrateNestedObject( {}, [ 'foo' ], 'value' );
		expect( actual ).toEqual( { foo: 'value' } );
	} );

	it( 'transforms flat object into flat object with array values', () => {
		const actual = hydrateNestedObject( {}, [ 'foo' ], [ 'value' ] );
		expect( actual ).toEqual( { foo: [ 'value' ] } );
	} );

	it( 'transforms nested object into nested object', () => {
		const actual = hydrateNestedObject( {}, [ 'foo', 'bar' ], 'value' );
		expect( actual ).toEqual( { foo: { bar: 'value' } } );
	} );

	it( 'transforms nested object into nested object merged with original object', () => {
		const actual = hydrateNestedObject( { name: 'human' }, [ 'foo', 'bar' ], 'value' );
		expect( actual ).toEqual( { name: 'human', foo: { bar: 'value' } } );
	} );

	it( 'transforms deeply nested object into nested object', () => {
		const actual = hydrateNestedObject( {}, [ 'foo', 'bar', 'baz', 'biz' ], 'value' );
		expect( actual ).toEqual( { foo: { bar: { baz: { biz: 'value' } } } } );
	} );
} );
