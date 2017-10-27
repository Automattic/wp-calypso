/** @format */
/**
 * Internal dependencies
 */
import reducer from '..';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		const initialState = reducer( undefined, {} );
		expect( initialState ).toMatchObject( {
			jetpackConnectSite: expect.anything(),
			jetpackConnectAuthorize: expect.anything(),
			jetpackConnectSessions: expect.anything(),
			jetpackSSO: expect.anything(),
			jetpackConnectSelectedPlans: expect.anything(),
			jetpackAuthAttempts: expect.anything(),
		} );
		expect( initialState ).toMatchSnapshot();
	} );
} );
