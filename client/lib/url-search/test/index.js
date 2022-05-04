import { expect } from 'chai';
import { buildSearchUrl } from '../';
import { buildSearchUrl as useUrlSearchBuildSearchUrl } from '../use-url-search';

describe( '#buildSearchUrl', () => {
	test( 'should return original url if there is no search', () => {
		const params = { uri: 'chicken.com' };
		expect( buildSearchUrl( params ) ).eql( 'chicken.com' );
		expect( useUrlSearchBuildSearchUrl( params ) ).eql( 'chicken.com' );
	} );

	test( 'should add add the default params of s to built query', () => {
		const params = {
			uri: 'google.com',
			search: 'hello',
		};
		const expectedResult = 'google.com?s=hello';
		expect( buildSearchUrl( params ) ).eql( expectedResult );
		expect( useUrlSearchBuildSearchUrl( params ) ).eql( expectedResult );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		const params = {
			uri: 'wordpress.com/read/search?q=reader+is+awesome',
			search: 'reader is super awesome',
			queryKey: 'q',
		};
		const expectedResult = 'wordpress.com/read/search?q=reader+is+super+awesome';
		expect( buildSearchUrl( params ) ).eql( expectedResult );
		expect( useUrlSearchBuildSearchUrl( params ) ).eql( expectedResult );
	} );

	test( 'should remove the query if search is empty', () => {
		const params = {
			uri: 'wordpress.com/read/search?q=reader+is+awesome',
			queryKey: 'q',
		};
		const expectedResult = 'wordpress.com/read/search';
		expect( buildSearchUrl( params ) ).eql( expectedResult );
		expect( useUrlSearchBuildSearchUrl( params ) ).eql( expectedResult );
	} );
} );
