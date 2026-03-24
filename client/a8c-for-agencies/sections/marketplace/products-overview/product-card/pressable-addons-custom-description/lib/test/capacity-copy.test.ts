import { getPressableAddonCapacityCopyContext } from '../capacity-copy';

describe( 'pressable addon capacity copy context', () => {
	it( 'maps pressable-addon-sites-1 with explicit deltas and exact formats', () => {
		expect( getPressableAddonCapacityCopyContext( 'pressable-addon-sites-1' ) ).toEqual( {
			type: 'sites',
			install: 1,
			storage: 10,
			visits: 10000,
			formattedInstall: '1',
			formattedStorage: '10 GB',
			formattedVisits: '10,000',
		} );
	} );

	it( 'maps pressable-addon-sites-5 with exact visits format', () => {
		expect( getPressableAddonCapacityCopyContext( 'pressable-addon-sites-5' ) ).toEqual( {
			type: 'sites',
			install: 5,
			storage: 20,
			visits: 50000,
			formattedInstall: '5',
			formattedStorage: '20 GB',
			formattedVisits: '50,000',
		} );
	} );

	it( 'maps pressable-addon-sites-10 with exact visits format', () => {
		expect( getPressableAddonCapacityCopyContext( 'pressable-addon-sites-10' ) ).toEqual( {
			type: 'sites',
			install: 10,
			storage: 20,
			visits: 100000,
			formattedInstall: '10',
			formattedStorage: '20 GB',
			formattedVisits: '100,000',
		} );
	} );

	it( 'maps pressable-addon-storage-1gb with exact storage format', () => {
		expect( getPressableAddonCapacityCopyContext( 'pressable-addon-storage-1gb' ) ).toEqual( {
			type: 'storage',
			install: 0,
			storage: 1,
			visits: 0,
			formattedInstall: '0',
			formattedStorage: '1 GB',
			formattedVisits: '0',
		} );
	} );

	it( 'maps pressable-addon-visits-10k with exact visits format', () => {
		expect( getPressableAddonCapacityCopyContext( 'pressable-addon-visits-10k' ) ).toEqual( {
			type: 'visits',
			install: 0,
			storage: 0,
			visits: 10000,
			formattedInstall: '0',
			formattedStorage: '0 GB',
			formattedVisits: '10,000',
		} );
	} );

	it( 'returns null for unknown add-on slug', () => {
		expect( getPressableAddonCapacityCopyContext( 'pressable-addon-sites-999' ) ).toBeNull();
	} );
} );
