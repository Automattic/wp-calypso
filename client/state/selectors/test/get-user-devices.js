import getUserDevices from 'calypso/state/selectors/get-user-devices';

describe( '#getUserDevices()', () => {
	test( 'should return an empty array if there are no devices', () => {
		const result = getUserDevices( {} );

		expect( Object.keys( result ) ).toHaveLength( 0 );
	} );
	test( 'should return all available user devices', () => {
		const userDevices = {
			1: { device_id: 1, device_name: 'Mobile Phone' },
			2: { device_id: 2, device_name: 'Tablet' },
		};
		const result = getUserDevices( { userDevices } );

		expect( result ).toEqual( [
			{ device_id: 1, device_name: 'Mobile Phone' },
			{ device_id: 2, device_name: 'Tablet' },
		] );
	} );
} );
