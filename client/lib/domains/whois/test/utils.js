import { whoisType } from '../constants';
import { findRegistrantWhois, findPrivacyServiceWhois } from '../utils';

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
		test( 'should return undefined when not registrant object found', () => {
			expect( findRegistrantWhois( [] ) ).toBeUndefined();
		} );
		test( 'should return registrant object from Whois data', () => {
			expect( findRegistrantWhois( whoisData ) ).toEqual( whoisData[ 0 ] );
		} );
	} );

	describe( 'findPrivacyServiceWhois', () => {
		test( 'should return undefined when not registrant object found', () => {
			expect( findPrivacyServiceWhois( [] ) ).toBeUndefined();
		} );
		test( 'should return privacy service object from Whois data', () => {
			expect( findPrivacyServiceWhois( whoisData ) ).toEqual( whoisData[ 1 ] );
		} );
	} );
} );
