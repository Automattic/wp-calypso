/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getTimezonesByContinent } from '../';
import { TIMEZONES_BY_CONTINENT } from 'state/timezones/test/fixture';

describe( 'getTimezonesByContinent()', () => {
	it( 'should return null if `timezones` aren\'t synced', () => {
		const state = {
			timezones: {
				items: {},
				requesting: null
			}
		};

		const manualUTCOffsets = getTimezonesByContinent( state );

		expect( manualUTCOffsets ).to.be.null;
	} );

	it( 'should return manual utc offset data', () => {
		const state = {
			timezones: {
				items: {
					timezones_by_continent: TIMEZONES_BY_CONTINENT
				},
				requesting: false,
			}
		};

		const offsets = getTimezonesByContinent( state );

		expect( offsets ).to.eql( TIMEZONES_BY_CONTINENT );
	} );
} );
