/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { isRewindActive } from 'state/selectors';

const siteId = 77203074;

describe( 'isRewindActive()', () => {
	it( 'should return false if no status exists for a site', () => {
		const stateNoSite = deepFreeze( {
			activityLog: {
				rewindStatus: {},
			},
		} );
		expect( isRewindActive( stateNoSite, siteId ) ).to.be.false;

		const stateNoStatus = deepFreeze( {
			activityLog: {
				rewindStatus: {
					[ siteId ]: null,
				},
			},
		} );
		expect( isRewindActive( stateNoStatus, siteId ) ).to.be.false;
	} );

	it( 'should return value of active for a site', () => {
		const stateTrue = deepFreeze( {
			activityLog: {
				rewindStatus: {
					[ siteId ]: {
						active: true,
					},
				},
			},
		} );
		expect( isRewindActive( stateTrue, siteId ) ).to.be.true;

		const stateFalse = deepFreeze( {
			activityLog: {
				rewindStatus: {
					[ siteId ]: {
						active: false,
					},
				},
			},
		} );

		expect( isRewindActive( stateFalse, siteId ) ).to.be.false;
	} );
} );
