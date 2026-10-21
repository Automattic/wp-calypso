import { buildCartItem } from '../../../test-helpers/factories/cart';
import { groupCartItems } from '../group-cart-items';

describe( 'groupCartItems', () => {
	it( 'leaves items without bundle metadata untouched', () => {
		const items = [
			buildCartItem( { uuid: '1', domain: 'one', tld: 'com' } ),
			buildCartItem( { uuid: '2', domain: 'two', tld: 'com' } ),
		];

		expect( groupCartItems( items ) ).toEqual( [
			{ type: 'item', item: items[ 0 ] },
			{ type: 'item', item: items[ 1 ] },
		] );
	} );

	it( 'folds items sharing a bundle group into a single entry at the first member position', () => {
		const memberCom = buildCartItem( {
			uuid: '1',
			domain: 'example',
			tld: 'com',
			bundle: { groupId: 'group-1', price: '$40' },
		} );
		const standalone = buildCartItem( { uuid: '2', domain: 'standalone', tld: 'org' } );
		const memberNet = buildCartItem( {
			uuid: '3',
			domain: 'example',
			tld: 'net',
			bundle: { groupId: 'group-1', price: '$40' },
		} );

		expect( groupCartItems( [ memberCom, standalone, memberNet ] ) ).toEqual( [
			{
				type: 'bundle',
				groupId: 'group-1',
				price: '$40',
				members: [ memberCom, memberNet ],
			},
			{ type: 'item', item: standalone },
		] );
	} );

	it( 'lists the primary member first even when a companion precedes it in cart order', () => {
		const companion = buildCartItem( {
			uuid: '1',
			domain: 'example',
			tld: 'net',
			bundle: { groupId: 'group-1', price: '$40', isPrimary: false },
		} );
		const primary = buildCartItem( {
			uuid: '2',
			domain: 'example',
			tld: 'com',
			bundle: { groupId: 'group-1', price: '$40', isPrimary: true },
		} );

		expect( groupCartItems( [ companion, primary ] ) ).toEqual( [
			{
				type: 'bundle',
				groupId: 'group-1',
				price: '$40',
				members: [ primary, companion ],
			},
		] );
	} );

	it( 'keeps distinct bundle groups separate', () => {
		const firstGroupMembers = [
			buildCartItem( { uuid: '1', bundle: { groupId: 'group-1', price: '$40' } } ),
			buildCartItem( { uuid: '2', bundle: { groupId: 'group-1', price: '$40' } } ),
		];
		const secondGroupMembers = [
			buildCartItem( { uuid: '3', bundle: { groupId: 'group-2', price: '$30' } } ),
			buildCartItem( { uuid: '4', bundle: { groupId: 'group-2', price: '$30' } } ),
		];

		expect( groupCartItems( [ ...firstGroupMembers, ...secondGroupMembers ] ) ).toEqual( [
			{ type: 'bundle', groupId: 'group-1', price: '$40', members: firstGroupMembers },
			{ type: 'bundle', groupId: 'group-2', price: '$30', members: secondGroupMembers },
		] );
	} );

	it( 'renders a degenerate single-member group as a plain item', () => {
		const lonelyMember = buildCartItem( {
			uuid: '1',
			bundle: { groupId: 'group-1', price: '$40' },
		} );

		expect( groupCartItems( [ lonelyMember ] ) ).toEqual( [
			{ type: 'item', item: lonelyMember },
		] );
	} );
} );
