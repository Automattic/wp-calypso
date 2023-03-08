import { getPathWithUpdatedQueryString } from '../utils';

describe( 'getPathWithUpdatedQueryString', () => {
	it( 'should return the path with the updated query string', () => {
		expect( getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?d=e&f=g' ) ).toEqual(
			'/a/b/c?d=e&f=g&h=i'
		);
		expect( getPathWithUpdatedQueryString( { f: 'i' }, '/a/b/c?d=e&f=g' ) ).toEqual(
			'/a/b/c?d=e&f=i'
		);
		expect( getPathWithUpdatedQueryString( { f: 'i' }, '/a/b/c' ) ).toEqual( '/a/b/c?f=i' );
		expect( getPathWithUpdatedQueryString( {}, '/a/b/c' ) ).toEqual( '/a/b/c' );
		expect( getPathWithUpdatedQueryString( {}, '/a/b/c?d=e' ) ).toEqual( '/a/b/c?d=e' );
	} );
	it( 'should walk around the page.js bug', () => {
		expect( getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?d=e&f=g?page=stats' ) ).toEqual(
			'/a/b/c?d=e&f=g&h=i'
		);
		expect(
			getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?d=e&f=g?page=stats?page=stats?page=stats' )
		).toEqual( '/a/b/c?d=e&f=g&h=i' );
		expect(
			getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?page=stats?page=stats?page=stats' )
		).toEqual( '/a/b/c?page=stats&h=i' );
		expect(
			getPathWithUpdatedQueryString( { h: 'i' }, '/a/b/c?h=k?page=stats?page=stats?page=stats' )
		).toEqual( '/a/b/c?h=i' );
	} );
} );
