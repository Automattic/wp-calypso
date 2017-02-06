/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingTimezones } from '../';

describe( 'isRequestingTimezones()', () => {
	it( 'should return true if the timezones are being fetched', () => {
		const state = {
			timezones: {
				requesting: true
			}
		};
		const output = isRequestingTimezones( state );
		expect( output ).to.be.true;
	} );

	it( 'should return false if the timezones are currently not being fetched', () => {
		const state = {
			timezones: {
				requesting: false
			}
		};
		const output = isRequestingTimezones( state );
		expect( output ).to.be.false;
	} );

	it( 'should return false if the timezones have never been requested', () => {
		const output = isRequestingTimezones( {} );
		expect( output ).to.be.false;
	} );
} );
