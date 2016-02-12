global.localStorage = require( 'localStorage' );

var expect = require( 'chai' ).expect,
	cloneDeep = require( 'lodash/cloneDeep' ),
	TreeConvert = require( 'lib/tree-convert' ),
	fixtures = require( './fixtures' );


describe( 'TreeConvert', function() {
	beforeEach( function() {
		this.converter = TreeConvert();
		this.menu = cloneDeep( fixtures.menusFlat.menus[0] );
	} );

	describe( 'treeify', function() {
		it( 'should turn a flat parent/child structure into a tree', function() {
			var treeified = this.converter.treeify( this.menu.items );

			expect( treeified ).to.have.length( 3 );
			expect( treeified[2].items ).to.be.instanceOf(Array);
		} );

		it( 'should order sibling items by their "order" property', function() {
			var treeified = this.converter.treeify( this.menu.items );

			expect( treeified[1].items[0] ).to.have.property( 'name', 'Socks' );
		} );

		it( 'should remove the "order" property from items, since order will be implicit', function() {
			var treeified = this.converter.treeify( this.menu.items );

			expect( treeified[1].items[0] ).not.to.have.property( 'order' );
		} );

		it( 'should handle bad parent data, falling back to parent 0', function() {
			var menu = cloneDeep( fixtures.menuBadParent ),
				treeified = this.converter.treeify( menu.items );

			// "About us" should become a top-level item
			expect( treeified ).to.have.length( 3 );
			expect( treeified[2] ).to.have.property( 'name', 'About us' );
		} );

	} );

	describe( 'untreeify', function() {
		it( 'should turn a tree into a parent child list', function() {
			var list, treeified = this.converter.treeify( this.menu.items );

			list = this.converter.untreeify( treeified );
			expect( list ).to.have.length( 9 );
		} );

		it( 'should add the "order" property to items', function() {
			var list, treeified = this.converter.treeify( this.menu.items );

			list = this.converter.untreeify( treeified );
			expect( list[0] ).to.have.property( 'order' );
		} );

		it( 'should not modify the original object', function() {
			var treeified = this.converter.treeify( this.menu.items ),
				list;

			expect( treeified[1] ).to.have.property( 'items' );
			list = this.converter.untreeify( treeified );
			expect( treeified[1] ).to.have.property( 'items' );
		} );
	} );
} );
