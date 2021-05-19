/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import getViewTrackerPath from '../get-view-tracker-path';

const path = '/pricing';
const siteSegment = ':site';
const siteId = 1;

describe( 'getViewTrackerPath', () => {
	it( 'should return the path with the site segment if the site id is passed', () => {
		expect( getViewTrackerPath( path, siteId ) ).toEqual( `${ path }/${ siteSegment }` );
	} );

	it( 'should return the path if it has the site segment and the site id is passed', () => {
		expect( getViewTrackerPath( `${ path }/${ siteSegment }`, siteId ) ).toEqual(
			`${ path }/${ siteSegment }`
		);
		expect( getViewTrackerPath( `${ path }/${ siteSegment }?`, siteId ) ).toEqual(
			`${ path }/${ siteSegment }`
		);
	} );

	it( 'should return the path without the site segment if no site id is passed', () => {
		expect( getViewTrackerPath( path ) ).toEqual( path );
		expect( getViewTrackerPath( `${ path }/${ siteSegment }` ) ).toEqual( path );
		expect( getViewTrackerPath( `${ path }/${ siteSegment }?` ) ).toEqual( path );
	} );
} );
