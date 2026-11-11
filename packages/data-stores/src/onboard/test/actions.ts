/**
 * @jest-environment jsdom
 */

import { setProfilerData, setTransferStartedAt, setTransferStatus } from '../actions';
import { ProfilerData } from '../types';

describe( 'actions', () => {
	const expectedProfilerData = {
		industry: 'clothing_and_accessories',
		persona: 'im_already_selling_online',
		platforms: [ 'shopify' ],
		store_location: 'us',
		store_name: 'Beautifully Handmade, 手工精美',
	} as ProfilerData;

	it( 'should return a SET_PROFILER_DATA action', () => {
		const expected = {
			type: 'SET_PROFILER_DATA',
			profilerData: expectedProfilerData,
		};

		expect( setProfilerData( expectedProfilerData ) ).toEqual( expected );
	} );

	it( 'should return transfer wait actions', () => {
		expect( setTransferStatus( 'active' ) ).toEqual( {
			type: 'SET_TRANSFER_STATUS',
			transferStatus: 'active',
		} );
		expect( setTransferStartedAt( 123 ) ).toEqual( {
			type: 'SET_TRANSFER_STARTED_AT',
			transferStartedAt: 123,
		} );
	} );
} );
