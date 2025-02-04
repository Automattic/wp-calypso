import { buildSearchUrl } from '../';

describe( '#buildSearchUrl', () => {
	test( 'should return original url if there is no search', () => {
		const params = { uri: 'chicken.com' };
		expect( buildSearchUrl( params ).toString() ).toEqual( 'https://chicken.com/' );
	} );

	test( 'should add add the default params of s to built query', () => {
		const params = {
			uri: 'google.com',
			search: 'hello',
		};
		const url = buildSearchUrl( params );
		expect( url.searchParams.get( 's' ) ).toEqual( 'hello' );
	} );

	test( 'should replace current query with new one even when using custom query key', () => {
		const params = {
			uri: 'wordpress.com/reader/search?q=reader+is+awesome',
			search: 'reader is super awesome',
			queryKey: 'q',
		};
		const url = buildSearchUrl( params );
		expect( url.searchParams.get( 'q' ) ).toEqual( 'reader is super awesome' );
	} );

	test( 'should stringify to convert spaces to +', () => {
		const params = {
			uri: 'wordpress.com/reader/search?q=reader+is+awesome',
			search: 'hello there',
			queryKey: 'q',
		};
		const url = buildSearchUrl( params );
		expect( url.search ).toEqual( '?q=hello+there' );
	} );

	test( 'should remove the query if search is empty', () => {
		const params = {
			uri: 'wordpress.com/reader/search?q=reader+is+awesome',
			queryKey: 'q',
		};
		const url = buildSearchUrl( params );
		expect( url.searchParams.get( 'q' ) ).toEqual( null );
	} );
} );
