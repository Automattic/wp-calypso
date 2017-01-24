/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getManualUtcOffsets } from '../';
import { MANUAL_UTC_OFFSETS } from 'state/timezones/test/fixture';

describe( 'getManualUtcOffsets()', () => {
	it( 'should return null if `timezones` aren\'t synced', () => {
		const state = {
			timezones: {
				items: {},
				requesting: null
			}
		};

		const manualUTCOffsets = getManualUtcOffsets( state );

		expect( manualUTCOffsets ).to.be.null;
	} );

	it( 'should return manual utc offset data', () => {
		const state = {
			timezones: {
				items: {
					manual_utc_offsets: MANUAL_UTC_OFFSETS
				}
			}
		};

		const offsets = getManualUtcOffsets( state );

		expect( offsets ).to.eql( MANUAL_UTC_OFFSETS );
	} );
} );
