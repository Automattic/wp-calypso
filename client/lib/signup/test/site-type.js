/**
 */

/**
 * Internal dependencies
 */

import { getSiteTypePropertyValue } from '../site-type';

describe( 'getSiteTypePropertyValue()', () => {
	const siteTypes = [
		{
			id: 1,
			slug: 'blah',
		},
		{
			id: 2,
			slug: 'nah',
		},
	];

	test( 'should return `null` by default', () => {
		expect( getSiteTypePropertyValue() ).toBeNull();
	} );

	test( 'should return `null` if key not found', () => {
		expect( getSiteTypePropertyValue( 'friday', 1, 'slug', siteTypes ) ).toBeNull();
	} );

	test( 'should return `null` if site type item not found', () => {
		expect( getSiteTypePropertyValue( 'id', 3, 'slug', siteTypes ) ).toBeNull();
	} );

	test( 'should return `null` if property not found', () => {
		expect( getSiteTypePropertyValue( 'id', 2, 'jug', siteTypes ) ).toBeNull();
	} );

	test( 'should return value of supplied property', () => {
		expect( getSiteTypePropertyValue( 'id', 1, 'slug', siteTypes ) ).toEqual( 'blah' );
		expect( getSiteTypePropertyValue( 'slug', 'nah', 'id', siteTypes ) ).toEqual( 2 );
	} );
} );
