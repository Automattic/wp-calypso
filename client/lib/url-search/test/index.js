import { expect } from 'chai';
import { buildSearchUrl } from '../';

describe( '#buildSearchUrl', () => {
	test( 'should return original url if there is no search', () => {
		const params = { uri: 'chicken.com' };
		expect( buildSearchUrl( params ) ).eql( 'chicken.com' );
	} );

	test( 'should add add the default params of s to built query', () => {
		const params = {
			uri: 'google.com',
			search: 'hello',
		};
		const url = buildSearchUrl( params );
		expect( url ).eql( 'google.com?s=hello' );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		const params = {
			uri: 'wordpress.com/read/search?q=reader+is+awesome',
			search: 'reader is super awesome',
			queryKey: 'q',
		};
		const url = buildSearchUrl( params );
		expect( url ).eql( 'wordpress.com/read/search?q=reader+is+super+awesome' );
	} );

	test( 'should remove the query if search is empty', () => {
		const params = {
			uri: 'wordpress.com/read/search?q=reader+is+awesome',
			queryKey: 'q',
		};
		const url = buildSearchUrl( params );
		expect( url ).eql( 'wordpress.com/read/search' );
	} );

	test( 'params', () => {
		const params = {
			uri: 'wordpress.com/read/search',
			search: 'term',
			queryKey: 'q',
			params: {
				test: 'test',
				test2: 'test1,test2',
			},
		};
		const url = buildSearchUrl( params );
		expect( url ).eql( 'wordpress.com/read/search?q=term&test=test&test2=test1%2Ctest2' );
	} );

	test( 'params unset if empty', () => {
		const params = {
			uri: 'wordpress.com/read/search?test2=removed',
			search: 'term',
			queryKey: 'q',
			params: {
				test: 'test',
				test2: '',
			},
		};
		const url = buildSearchUrl( params );
		expect( url ).eql( 'wordpress.com/read/search?q=term&test=test' );
	} );
} );
