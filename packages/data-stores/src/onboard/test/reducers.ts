import { profilerData } from '../reducer';
import { ProfilerData } from '../types';

describe( 'reducer', () => {
	it( 'returns the correct default state', () => {
		const state = profilerData( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( undefined );
	} );

	it( 'returns the profiler data', () => {
		const expectedProfilerData = {
			industry: 'clothing_and_accessories',
			persona: 'im_already_selling_online',
			platforms: [ 'shopify' ],
			store_location: 'us',
			store_name: 'Beautifully Handmade, 手工精美',
		} as ProfilerData;

		const state = profilerData( undefined, {
			type: 'SET_PROFILER_DATA',
			profilerData: expectedProfilerData,
		} );

		expect( state ).toEqual( expectedProfilerData );
	} );
} );
