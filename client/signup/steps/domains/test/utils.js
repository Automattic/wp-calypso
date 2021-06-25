/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	getExternalBackUrl,
	backUrlExternalSourceStepsOverrides,
	backUrlSourceOverrides,
} from '../utils';

const backUrlSourceOverrideKeys = Object.keys( backUrlSourceOverrides );
const backUrlSourceOverrideKey = backUrlSourceOverrideKeys[ 0 ];

describe( 'getExternalBackUrl', () => {
	test( 'it should return false if given no first source arg', () => {
		const result = getExternalBackUrl( undefined );
		expect( result ).toBe( false );
		expect( result ).toBeFalsy();
	} );

	test( 'it should return false if given an unexpected first argument that is also an invalid url', () => {
		const result = getExternalBackUrl( 'unexpected-string' );
		expect( result ).toBe( false );
		expect( result ).toBeFalsy();
	} );

	test( 'it should return correct value if the given source is a key on the overrides object', () => {
		const result = getExternalBackUrl( backUrlSourceOverrideKey );
		expect( result ).toBe( backUrlSourceOverrides[ backUrlSourceOverrideKey ] );
		expect( result ).toBeTruthy();
	} );

	test( 'it should return false if given a valid url and an unexpected step name', () => {
		const result = getExternalBackUrl( 'https://wordpress.com', 'step-does-not-exist' );
		expect( result ).toBe( false );
		expect( result ).toBeFalsy();
	} );

	test( 'it should return external url if given a valid url and an expected step name', () => {
		const result = getExternalBackUrl(
			'https://wordpress.com',
			backUrlExternalSourceStepsOverrides[ 0 ]
		);
		expect( result ).toBe( 'https://wordpress.com' );
		expect( result ).toBeTruthy();
	} );
} );
