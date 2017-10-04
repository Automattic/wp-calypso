/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getRewindStatusError } from 'state/selectors';

const siteId = 77203074;

describe( 'getRewindStatusError()', () => {
	it( 'should return null if no error exists for a site', () => {
		const stateNoSite = deepFreeze( {
			activityLog: {
				rewindStatusError: {},
			},
		} );
		expect( getRewindStatusError( stateNoSite, siteId ) ).to.be.null;

		const stateNoError = deepFreeze( {
			activityLog: {
				rewindStatusError: {
					[ siteId ]: null,
				},
			},
		} );
		expect( getRewindStatusError( stateNoError, siteId ) ).to.be.null;
	} );

	it( 'should return an existing error for a site', () => {
		const error = {
			error: 'vp_api_error',
			message: 'No site found.',
			status: 400,
		};
		const state = deepFreeze( {
			activityLog: {
				rewindStatusError: {
					[ siteId ]: error,
				},
			},
		} );

		expect( getRewindStatusError( state, siteId ) ).to.equal( error );
	} );
} );
