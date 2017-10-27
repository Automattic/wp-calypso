/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '..';

const jestExpect = global.expect;

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		const initialState = reducer( undefined, {} );
		expect( initialState ).to.have.keys( [
			'jetpackConnectSite',
			'jetpackConnectAuthorize',
			'jetpackConnectSessions',
			'jetpackSSO',
			'jetpackConnectSelectedPlans',
			'jetpackAuthAttempts',
		] );
		jestExpect( initialState ).toMatchSnapshot();
	} );
} );
