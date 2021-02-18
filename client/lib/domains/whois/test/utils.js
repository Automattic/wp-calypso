/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { findRegistrantWhois, findPrivacyServiceWhois } from '../utils';
import { whoisType } from '../constants';

describe( 'utils', () => {
	const whoisData = [
		{
			org: 'The best company',
			type: whoisType.REGISTRANT,
		},
		{
			org: 'Privacy R US',
			type: whoisType.PRIVACY_SERVICE,
		},
	];

	describe( 'findRegistrantWhois', () => {
		test( 'should return undefined when not registrant object found ', () => {
			expect( findRegistrantWhois( [] ) ).to.be.undefined;
		} );
		test( 'should return registrant object from Whois data ', () => {
			expect( findRegistrantWhois( whoisData ) ).to.be.eql( whoisData[ 0 ] );
		} );
	} );

	describe( 'findPrivacyServiceWhois', () => {
		test( 'should return undefined when not registrant object found ', () => {
			expect( findPrivacyServiceWhois( [] ) ).to.be.undefined;
		} );
		test( 'should return privacy service object from Whois data ', () => {
			expect( findPrivacyServiceWhois( whoisData ) ).to.be.eql( whoisData[ 1 ] );
		} );
	} );
} );
