/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getRewindStartDate } from 'state/selectors';

const siteId = 77203074;

describe( 'getRewindStartDate()', () => {
	it( 'should return empty string if no start date exists for a site', () => {
		const stateNoSite = deepFreeze( {
			activityLog: {
				rewindStatus: {},
			},
		} );
		expect( getRewindStartDate( stateNoSite, siteId ) ).to.be.equal( '' );

		const stateNoStartDate = deepFreeze( {
			activityLog: {
				rewindStatus: {
					[ siteId ]: null,
				},
			},
		} );
		expect( getRewindStartDate( stateNoStartDate, siteId ) ).to.be.equal( '' );
	} );

	it( 'should return an existing start date for a site', () => {
		const state = deepFreeze( {
			activityLog: {
				rewindStatus: {
					[ siteId ]: {
						firstBackupDate: '2017-05-04 05:00:00',
					},
				},
			},
		} );

		expect( getRewindStartDate( state, siteId ) ).to.equal( '2017-05-04 05:00:00' );
	} );
} );
