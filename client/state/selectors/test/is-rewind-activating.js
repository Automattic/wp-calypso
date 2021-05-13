/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isRewindActivating from 'calypso/state/selectors/is-rewind-activating';

const siteId = 77203074;

describe( 'isRewindActivating()', () => {
	test( 'should return false if no status exists for a site', () => {
		const stateNoSite = deepFreeze( {
			activityLog: {
				activationRequesting: {},
			},
		} );
		expect( isRewindActivating( stateNoSite, siteId ) ).to.be.false;

		const stateNoValue = deepFreeze( {
			activityLog: {
				activationRequesting: {
					[ siteId ]: null,
				},
			},
		} );
		expect( isRewindActivating( stateNoValue, siteId ) ).to.be.false;
	} );

	test( 'should return the value for a site', () => {
		const stateTrue = deepFreeze( {
			activityLog: {
				activationRequesting: {
					[ siteId ]: true,
				},
			},
		} );
		expect( isRewindActivating( stateTrue, siteId ) ).to.be.true;

		const stateFalse = deepFreeze( {
			activityLog: {
				activationRequesting: {
					[ siteId ]: false,
				},
			},
		} );

		expect( isRewindActivating( stateFalse, siteId ) ).to.be.false;
	} );
} );
