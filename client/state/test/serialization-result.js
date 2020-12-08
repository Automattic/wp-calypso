/**
 * Internal dependencies
 */
import { SerializationResult } from 'calypso/state/serialization-result';

describe( 'SerializationResult', () => {
	test( 'simple root result', () => {
		const result = new SerializationResult();
		expect( result.get() ).toEqual( {} );
		result.addRootResult( 'key1', 'data1' );
		expect( result.get() ).toEqual( { root: { key1: 'data1' } } );
		result.addRootResult( 'key2', 'data2' );
		expect( result.get() ).toEqual( { root: { key1: 'data1', key2: 'data2' } } );
	} );

	test( 'complex root result', () => {
		const result = new SerializationResult( {
			root: { key1: 'data1' },
		} );

		result.addRootResult(
			'key2',
			new SerializationResult( {
				root: 'data2',
				posts: { 1: 'hello' },
			} )
		);

		expect( result.get() ).toEqual( {
			root: { key1: 'data1', key2: 'data2' },
			posts: { 1: 'hello' },
		} );
	} );

	test( 'complex nested root result', () => {
		const result = new SerializationResult( {
			root: { key1: 'data1' },
		} );

		result.addRootResult(
			'key2',
			new SerializationResult( {
				root: new SerializationResult( {
					root: 'data2',
					pages: { 1: 'about' },
				} ),
				posts: { 1: 'hello' },
			} )
		);

		expect( result.get() ).toEqual( {
			root: { key1: 'data1', key2: 'data2' },
			posts: { 1: 'hello' },
			pages: { 1: 'about' },
		} );
	} );

	test( 'simple key result', () => {
		const result = new SerializationResult( {
			root: { key1: 'data1' },
		} );

		result.addKeyResult( 'posts', { 1: 'hello' } );

		expect( result.get() ).toEqual( {
			root: { key1: 'data1' },
			posts: { 1: 'hello' },
		} );
	} );

	test( 'key result is overwritten', () => {
		const result = new SerializationResult( {
			posts: { 1: 'hello' },
		} );

		result.addKeyResult( 'posts', { 2: 'world' } );

		expect( result.get() ).toEqual( {
			posts: { 2: 'world' },
		} );
	} );

	test( 'complex nested key result', () => {
		const result = new SerializationResult( {
			root: { key1: 'data1' },
		} );

		result.addKeyResult(
			'posts',
			new SerializationResult( {
				root: new SerializationResult( {
					root: { 1: 'hello' },
					comments: { 1: 'comment' },
				} ),
				pages: { 1: 'about' },
			} )
		);

		expect( result.get() ).toEqual( {
			root: { key1: 'data1' },
			posts: { 1: 'hello' },
			pages: { 1: 'about' },
			comments: { 1: 'comment' },
		} );
	} );
} );
