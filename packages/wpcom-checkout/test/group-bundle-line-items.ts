import { groupBundleLineItems } from '../src/group-bundle-line-items';
import {
	buildBundleResponseCart,
	buildDomainProduct,
	buildMultiBundleResponseCart,
} from './fixtures/bundle-cart';

describe( 'groupBundleLineItems', () => {
	test( 'returns ungrouped products as plain product entries in order', () => {
		const a = buildDomainProduct( { uuid: 'a', meta: 'a.com' } );
		const b = buildDomainProduct( { uuid: 'b', meta: 'b.com' } );

		expect( groupBundleLineItems( [ a, b ] ) ).toEqual( [
			{ type: 'product', product: a },
			{ type: 'product', product: b },
		] );
	} );

	test( 'folds products sharing a group id into a single bundle entry', () => {
		const primary = buildDomainProduct(
			{ uuid: 'p', meta: 'example.com' },
			{ groupId: 'g1', role: 'primary' }
		);
		const companion = buildDomainProduct(
			{ uuid: 'c', meta: 'example.net' },
			{ groupId: 'g1', role: 'companion' }
		);

		const result = groupBundleLineItems( [ primary, companion ] );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ] ).toEqual( {
			type: 'bundle',
			groupId: 'g1',
			products: [ primary, companion ],
		} );
	} );

	test( 'positions the bundle where its first member appears and keeps other products in place', () => {
		const lead = buildDomainProduct( { uuid: 'lead', meta: 'lead.com' } );
		const primary = buildDomainProduct(
			{ uuid: 'p', meta: 'example.com' },
			{ groupId: 'g1', role: 'primary' }
		);
		const trailing = buildDomainProduct( { uuid: 'trail', meta: 'trail.com' } );
		const companion = buildDomainProduct(
			{ uuid: 'c', meta: 'example.net' },
			{ groupId: 'g1', role: 'companion' }
		);

		const result = groupBundleLineItems( [ lead, primary, trailing, companion ] );

		expect(
			result.map( ( entry ) => ( entry.type === 'bundle' ? entry.groupId : entry.product.uuid ) )
		).toEqual( [ 'lead', 'g1', 'trail' ] );
	} );

	test( 'orders bundle members primary-first then companions in cart order', () => {
		const companionFirst = buildDomainProduct(
			{ uuid: 'c1', meta: 'a.net' },
			{ groupId: 'g1', role: 'companion' }
		);
		const primary = buildDomainProduct(
			{ uuid: 'p', meta: 'a.com' },
			{ groupId: 'g1', role: 'primary' }
		);
		const companionSecond = buildDomainProduct(
			{ uuid: 'c2', meta: 'a.org' },
			{ groupId: 'g1', role: 'companion' }
		);

		const [ entry ] = groupBundleLineItems( [ companionFirst, primary, companionSecond ] );

		const memberUuids = entry.type === 'bundle' ? entry.products.map( ( p ) => p.uuid ) : [];

		expect( entry.type ).toBe( 'bundle' );
		expect( memberUuids ).toEqual( [ 'p', 'c1', 'c2' ] );
	} );

	test( 'keeps distinct group ids as separate bundles', () => {
		const g1a = buildDomainProduct( { uuid: 'g1a' }, { groupId: 'g1', role: 'primary' } );
		const g1b = buildDomainProduct( { uuid: 'g1b' }, { groupId: 'g1', role: 'companion' } );
		const g2a = buildDomainProduct( { uuid: 'g2a' }, { groupId: 'g2', role: 'primary' } );
		const g2b = buildDomainProduct( { uuid: 'g2b' }, { groupId: 'g2', role: 'companion' } );

		const result = groupBundleLineItems( [ g1a, g1b, g2a, g2b ] );

		expect( result ).toHaveLength( 2 );
		expect( result.every( ( entry ) => entry.type === 'bundle' ) ).toBe( true );
	} );

	test( 'falls back to a plain product when a group has only one surviving member', () => {
		const lonely = buildDomainProduct(
			{ uuid: 'lonely', meta: 'lonely.com' },
			{ groupId: 'g1', role: 'primary' }
		);

		expect( groupBundleLineItems( [ lonely ] ) ).toEqual( [
			{ type: 'product', product: lonely },
		] );
	} );

	test( 'returns an empty list for an empty cart', () => {
		expect( groupBundleLineItems( [] ) ).toEqual( [] );
	} );

	test( 'splits a realistic cart into one bundle group and the standalone plan', () => {
		const result = groupBundleLineItems( buildBundleResponseCart().products );

		expect(
			result.map( ( entry ) => ( entry.type === 'bundle' ? entry.groupId : entry.product.uuid ) )
		).toEqual( [ 'bundle-abc', 'plan' ] );

		const [ bundleEntry ] = result;
		const memberUuids =
			bundleEntry.type === 'bundle' ? bundleEntry.products.map( ( p ) => p.uuid ) : [];

		expect( memberUuids ).toEqual( [ 'primary', 'companion-net', 'companion-org' ] );
	} );

	describe( 'multi-bundle carts', () => {
		test( 'folds each distinct group into its own bundle entry around the standalone product', () => {
			const result = groupBundleLineItems( buildMultiBundleResponseCart().products );

			expect(
				result.map( ( entry ) => ( entry.type === 'bundle' ? entry.groupId : entry.product.uuid ) )
			).toEqual( [ 'bundle-thalasso', 'standalone', 'bundle-brimnir' ] );
		} );

		test( 'positions each bundle at its first member and keeps the standalone product in place', () => {
			const result = groupBundleLineItems( buildMultiBundleResponseCart().products );

			// The standalone domain sits at index 3 in the source cart, after the
			// three thalasso members; once those fold into one entry it lands at
			// index 1, between the two grouped bundles.
			expect( result ).toHaveLength( 3 );
			expect( result[ 0 ] ).toMatchObject( { type: 'bundle', groupId: 'bundle-thalasso' } );
			expect( result[ 1 ] ).toMatchObject( {
				type: 'product',
				product: { uuid: 'standalone' },
			} );
			expect( result[ 2 ] ).toMatchObject( { type: 'bundle', groupId: 'bundle-brimnir' } );
		} );

		test( 'orders members primary-first within each group independently', () => {
			const result = groupBundleLineItems( buildMultiBundleResponseCart().products );

			const membersByGroup = Object.fromEntries(
				result
					.filter( ( entry ) => entry.type === 'bundle' )
					.map( ( entry ) => [ entry.groupId, entry.products.map( ( product ) => product.uuid ) ] )
			);

			expect( membersByGroup[ 'bundle-thalasso' ] ).toEqual( [
				'thalasso-com',
				'thalasso-org',
				'thalasso-net',
			] );
			expect( membersByGroup[ 'bundle-brimnir' ] ).toEqual( [
				'brimnir-info',
				'brimnir-co',
				'brimnir-vip',
			] );
		} );

		test( "each group's total sums only its own members, with no cross-contamination", () => {
			const result = groupBundleLineItems( buildMultiBundleResponseCart().products );

			const totalByGroup = Object.fromEntries(
				result
					.filter( ( entry ) => entry.type === 'bundle' )
					.map( ( entry ) => [
						entry.groupId,
						entry.products.reduce( ( sum, product ) => sum + product.item_subtotal_integer, 0 ),
					] )
			);

			// thalasso: 2200 + 2000 + 1800
			expect( totalByGroup[ 'bundle-thalasso' ] ).toBe( 6000 );
			// brimnir: 1500 + 2500 + 4200
			expect( totalByGroup[ 'bundle-brimnir' ] ).toBe( 8200 );
		} );

		test( 'leaves the standalone product untouched', () => {
			const sourceProducts = buildMultiBundleResponseCart().products;
			const standalone = sourceProducts.find( ( product ) => product.uuid === 'standalone' );

			const result = groupBundleLineItems( sourceProducts );
			const standaloneEntry = result.find(
				( entry ) => entry.type === 'product' && entry.product.uuid === 'standalone'
			);

			expect( standaloneEntry ).toEqual( { type: 'product', product: standalone } );
		} );

		test( 'produces unique, stable group ids usable as render keys', () => {
			const result = groupBundleLineItems( buildMultiBundleResponseCart().products );

			const keys = result
				.filter( ( entry ) => entry.type === 'bundle' )
				.map( ( entry ) => `bundle-${ entry.groupId }` );

			expect( keys ).toEqual( [ 'bundle-bundle-thalasso', 'bundle-bundle-brimnir' ] );
			expect( new Set( keys ).size ).toBe( keys.length );
		} );
	} );
} );
