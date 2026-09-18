import { MEMBERSHIPS_PRODUCT_DELETE_FAILURE } from 'calypso/state/action-types';
import { deserialize, serialize } from 'calypso/state/utils';
import { items } from '../reducer';

describe( 'items', () => {
	test.each( [ { is_read_only: true }, { is_read_only: false }, {} ] )(
		'preserves persisted products with read-only metadata %s',
		( metadata ) => {
			const state = { 1: [ { ID: 1, title: 'Plan', ...metadata } ] };

			expect( deserialize( items, serialize( items, state ) ) ).toEqual( state );
		}
	);

	test( 'restores only the product whose deletion failed', () => {
		const annualProduct = { ID: 2, title: 'Annual', tier: 1, is_read_only: false };

		expect(
			items(
				{ 1: [] },
				{
					type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
					siteId: 1,
					product: annualProduct,
				}
			)
		).toEqual( { 1: [ annualProduct ] } );
	} );

	test( 'does not duplicate a failed product that was already refetched', () => {
		const product = { ID: 1, title: 'Plan', is_read_only: true };

		expect(
			items(
				{ 1: [ product ], 2: [] },
				{
					type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
					siteId: 1,
					product,
				}
			)
		).toEqual( { 1: [ product ], 2: [] } );
	} );
} );
