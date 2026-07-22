/**
 * @jest-environment node
 */
import { selectCommissionSites } from '../select-commission-sites';
import type { MigrationCommissionSite } from '@automattic/api-core';

const site = ( overrides: Partial< MigrationCommissionSite > ): MigrationCommissionSite => ( {
	id: 1,
	blog_id: 1,
	created_at: 0,
	url: 'example.com',
	state: 'active',
	tags: [],
	incentive_status: 'pending',
	...overrides,
} );

describe( 'selectCommissionSites', () => {
	it( 'keeps sites with a known incentive status', () => {
		const sites = [
			site( { id: 1, incentive_status: 'pending' } ),
			site( { id: 2, incentive_status: 'verified' } ),
			site( { id: 3, incentive_status: 'paid' } ),
			site( { id: 4, incentive_status: 'rejected' } ),
			site( { id: 5, incentive_status: 'reverification' } ),
			site( { id: 6, incentive_status: 'ineligible' } ),
		];

		expect( selectCommissionSites( sites ) ).toHaveLength( 6 );
	} );

	it( 'drops sites with an unknown or empty incentive status', () => {
		const sites = [
			site( { id: 1, incentive_status: 'pending' } ),
			site( { id: 2, incentive_status: '' } ),
			site( { id: 3, incentive_status: 'something-else' } ),
		];

		const result = selectCommissionSites( sites );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].id ).toBe( 1 );
	} );

	it( 'returns an empty array when nothing matches', () => {
		expect( selectCommissionSites( [ site( { incentive_status: 'unknown' } ) ] ) ).toEqual( [] );
	} );
} );
