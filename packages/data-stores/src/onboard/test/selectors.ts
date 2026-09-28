/**
 * @jest-environment jsdom
 */

import { getProfilerData, getTransferStartedAt, getTransferStatus } from '../selectors';
import type { State } from '../reducer';

describe( 'selectors', () => {
	it( 'should return the profiler data', () => {
		const expectedProfilerData = {
			industry: 'clothing_and_accessories',
			persona: 'im_already_selling_online',
			platforms: [ 'shopify' ],
			store_location: 'us',
			store_name: 'Beautifully Handmade, 手工精美',
		};
		const state: State = {
			profilerData: expectedProfilerData,
		};
		expect( getProfilerData( state ) ).toEqual( expectedProfilerData );
	} );

	it( 'should return transfer wait state', () => {
		const state: State = { transferStatus: 'active', transferStartedAt: 123 };

		expect( getTransferStatus( state ) ).toBe( 'active' );
		expect( getTransferStartedAt( state ) ).toBe( 123 );
	} );
} );
