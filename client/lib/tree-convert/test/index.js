/**
 * External dependencies
 */
import { expect } from 'chai';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Internal dependencies
 */
import { menusFlat, menuBadParent } from './fixtures';
import TreeConvert from '../index';

describe( 'TreeConvert', () => {
	let converter, menu;

	beforeEach( () => {
		converter = TreeConvert();
		menu = cloneDeep( menusFlat.menus[ 0 ] );
	} );

	describe( 'treeify', () => {
		it( 'should turn a flat parent/child structure into a tree', () => {
			const treeified = converter.treeify( menu.items );

			expect( treeified ).to.have.length( 3 );
			expect( treeified[ 2 ].items ).to.be.instanceOf( Array );
		} );

		it( 'should order sibling items by their "order" property', () => {
			const treeified = converter.treeify( menu.items );

			expect( treeified[ 1 ].items[ 0 ] ).to.have.property( 'name', 'Socks' );
		} );

		it( 'should remove the "order" property from items, since order will be implicit', () => {
			const treeified = converter.treeify( menu.items );

			expect( treeified[ 1 ].items[ 0 ] ).not.to.have.property( 'order' );
		} );

		it( 'should handle bad parent data, falling back to parent 0', () => {
			const badMenu = cloneDeep( menuBadParent ),
				treeified = converter.treeify( badMenu.items );

			// "About us" should become a top-level item
			expect( treeified ).to.have.length( 3 );
			expect( treeified[ 2 ] ).to.have.property( 'name', 'About us' );
		} );
	} );

	describe( 'untreeify', () => {
		it( 'should turn a tree into a parent child list', () => {
			const treeified = converter.treeify( menu.items ),
				list = converter.untreeify( treeified );

			expect( list ).to.have.length( 9 );
		} );

		it( 'should add the "order" property to items', () => {
			const treeified = converter.treeify( menu.items ),
				list = converter.untreeify( treeified );

			expect( list[ 0 ] ).to.have.property( 'order' );
		} );

		it( 'should not modify the original object', () => {
			const treeified = converter.treeify( menu.items );
			expect( treeified[ 1 ] ).to.have.property( 'items' );

			converter.untreeify( treeified );
			expect( treeified[ 1 ] ).to.have.property( 'items' );
		} );
	} );
} );
