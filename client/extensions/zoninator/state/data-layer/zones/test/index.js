/**
 * Internal dependencies
 */
import { zoneFromApi, zonesListFromApi } from '../utils';

test( 'should convert zones list response to a zones list object', () => {
	const zonesListResponse = {
		data: [
			{
				term_id: 23,
				name: 'Test zone',
				slug: 'test-zone',
				description: 'A test zone.',
			},
		],
	};

	expect( zonesListFromApi( zonesListResponse ) ).toEqual( {
		23: {
			id: 23,
			name: 'Test zone',
			slug: 'test-zone',
			description: 'A test zone.',
		},
	} );
} );

test( 'should convert zone response to a zone object', () => {
	const createZoneResponse = {
		data: {
			term_id: 43,
			name: 'New zone',
			slug: 'new-zone',
			description: 'A new zone',
		},
	};

	expect( zoneFromApi( createZoneResponse ) ).toEqual( {
		id: 43,
		name: 'New zone',
		slug: 'new-zone',
		description: 'A new zone',
	} );
} );
