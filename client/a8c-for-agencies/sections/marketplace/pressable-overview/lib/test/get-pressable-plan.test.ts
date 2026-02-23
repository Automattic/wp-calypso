import getPressablePlan from '../get-pressable-plan';

describe( 'getPressablePlan add-on mappings', () => {
	it( 'returns ticket-defined site add-on capacities', () => {
		expect( getPressablePlan( 'site_addon_1' ) ).toMatchObject( {
			install: 1,
			storage: 10,
			visits: 10000,
		} );
		expect( getPressablePlan( 'site_addon_5' ) ).toMatchObject( {
			install: 5,
			storage: 20,
			visits: 50000,
		} );
		expect( getPressablePlan( 'site_addon_10' ) ).toMatchObject( {
			install: 10,
			storage: 20,
			visits: 100000,
		} );
	} );

	it( 'returns alias capacities used by license keys', () => {
		expect( getPressablePlan( 'pressable-addon-sites-1' ) ).toMatchObject( {
			install: 1,
			storage: 10,
			visits: 10000,
		} );
		expect( getPressablePlan( 'pressable-addon-visits-10k' ) ).toMatchObject( {
			install: 0,
			storage: 0,
			visits: 10000,
		} );
		expect( getPressablePlan( 'pressable-addon-storage-1gb' ) ).toMatchObject( {
			install: 0,
			storage: 1,
			visits: 0,
		} );
	} );

	it( 'returns titan add-on with zero usage-impact capacities', () => {
		expect( getPressablePlan( 'titan_addon' ) ).toMatchObject( {
			install: 0,
			storage: 0,
			visits: 0,
			unit: 'inbox',
		} );
	} );
} );
