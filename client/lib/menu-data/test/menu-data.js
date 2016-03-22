/**
 * Tests for menu-data.js
 */

/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import sinon from 'sinon';
import find from 'lodash/find';
import last from 'lodash/last';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { deepMapValues } from 'lodash-deep';

/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'MenuData', function() {
	let MenuData, wp, fixtures;

	useFilesystemMocks( __dirname );
	useFakeDom();

	before( function() {
		MenuData = require( '../menu-data' ).default,
		wp = require( 'lib/wp' ),
		fixtures = require( './fixtures' );
	} );

	beforeEach( function() {
		this.menuData = new MenuData();
		this.wpMenusCall = sinon.spy( wp, 'menus' );
	} );

	afterEach( function() {
		wp.menus.restore();
	} );

	context( 'home page item injection', function () {
		beforeEach( function () {
			this.oldSiteURL = this.menuData.site.URL;
			this.menuData.site.URL = 'http://example.com';
		} );

		afterEach( function () {
			this.menuData.site.URL = this.oldSiteURL;
		} );

		describe( 'generateHomePageMenuItem', function () {
			it( 'should return the correct type', function () {
				var item = this.menuData.generateHomePageMenuItem();
				expect( item.type ).to.equal( 'page' );
				expect( item.type_family ).to.equal( 'post_type' );
				expect( item.status ).to.equal( 'publish' );
			} );

			it( 'should contain the title as suffix if there is one', function () {
				var postTitle = 'XCVXCV';
				var item = this.menuData.generateHomePageMenuItem( postTitle );
				expect( item.name ).to.include( postTitle );
			} );

			it( 'should append / to end of the URL if the site doesn\'t have one', function () {
				var item = this.menuData.generateHomePageMenuItem();
				expect( item.url ).to.equal( 'http://example.com/' );
			} );

			it( 'should not append / to end of the URL if there\'s already one', function () {
				this.menuData.site.URL = 'http://example.com/';
				var item = this.menuData.generateHomePageMenuItem();
				expect( item.url ).to.equal( 'http://example.com/' );
			} );
		} );

		describe ( 'interceptSaveForHomepageLink', function () {
			it( 'should convert the home item to link', function () {
				var item = this.menuData.generateHomePageMenuItem(),
					menu = { items: [item] },
					interceptedMenu = this.menuData.interceptSaveForHomepageLink( menu );

				expect( interceptedMenu.items[0].type ).to.equal( 'custom' );
				expect( interceptedMenu.items[0].type_family ).to.equal( 'custom' );
				expect( interceptedMenu.items[0].url ).to.equal( 'http://example.com/' );
			} );

		} );

		describe( 'interceptLoadForHomepageLink', function () {
			beforeEach( function () {
				this.menuItem = this.menuData.generateHomePageMenuItem();
				this.menu = { items: [this.menuItem] };
			} );
			it( 'should convert the home link to page item', function () {
				var pageItemOriginal = this.menuData.generateHomePageMenuItem(),
					interceptedItem = this.menuData.interceptLoadForHomepageLink( this.menu ).items[0];

				expect( interceptedItem.type ).to.equal( 'page' );
				expect( interceptedItem.type_family ).to.equal( 'post_type' );
				expect( interceptedItem.content_id ).to.equal( pageItemOriginal.content_id );

			} );

			it( 'should match home link ending without /', function () {
				var interceptedItem;
				this.menuItem.url = this.menuData.site.URL.replace( /\/$/, '' );
				interceptedItem = this.menuData.interceptLoadForHomepageLink( this.menu ).items[0];

				expect( interceptedItem.type ).to.equal( 'page' );

			} );

			it( 'should match home link ending with /', function () {
				var interceptedItem;
				this.menuItem.url = this.menuData.site.URL + '/';
				interceptedItem = this.menuData.interceptLoadForHomepageLink( this.menu ).items[0];

				expect( interceptedItem.type ).to.equal( 'page' );

			});
		} );
	} );


	describe( 'singleton', function() {

		it( 'should return the same valid MenuData instance everytime', function() {
			var i1 = require( 'lib/menu-data' ),
				i2 = require( 'lib/menu-data' );
			assert( i1 instanceof MenuData );
			assert( i1 === i2 );
		} );

	} );

	describe( 'fetch', function() {

		it ( 'should fire "change" event', function() {
			var eventSpy = sinon.spy();

			this.menuData.on( 'change', eventSpy );
			this.menuData.fetch();

			assert(eventSpy.called, 'Event not fired');
			assert(eventSpy.calledOnce, 'Event fired more than once');
		} );

		it ( 'should decode HTML entities', function() {
			this.menuData.fetch();
			assert( this.menuData.data.menus[1].name === 'Menu 2 &c.', 'Ampersand in menu name not decoded' );
			assert( this.menuData.data.menus[2].description === 'The third menu is dull & boring', 'Ampersand in menu description not decoded' );
			assert( this.menuData.data.menus[1].items[0].name === 'Item 21 & counting', 'Ampersand in menu item name not decoded' );

			assert( this.menuData.data.locations[2].name === 'social&lite', 'Ampersand in location name not decoded' );
			assert( this.menuData.data.locations[0].description === 'Top & Primary Menu', 'Ampersand in location description not decoded' );

		} );
	} );

	describe( 'isValidMenu', function() {

		it ( 'should return truthy value when supplied menu exists', function() {
			assert.ok( this.menuData.isValidMenu( { id: 1 } ) );
		} );

		it ( 'should return falsy value when supplied menu does not exist', function() {
			assert.notOk( this.menuData.isValidMenu( { id: 99 } ) );
			assert.notOk( this.menuData.isValidMenu( 'blah') );
			assert.notOk( this.menuData.isValidMenu() );
		} );
	} );

	describe( 'getMenu', function() {

		it( 'should return the menu currently assigned to the supplied location, if any', function() {
			var menu = this.menuData.getMenu( 'primary' );
			expect( menu.name ).to.equal( 'Menu 1' );

			menu = this.menuData.getMenu( 'social' );
			expect( menu ).to.be.null;

			menu = this.menuData.getMenu( 'dummy' );
			expect( menu ).to.be.null;
		} );
	} );

	describe( 'updateMenuItem', function() {

		beforeEach( function() {
			this.changeEventSpy = sinon.spy();
			this.menuData.on( 'change', this.changeEventSpy );

			// Update an item
			var menu = this.menuData.getMenu( 'primary' ),
					item = menu.items[0];
			this.itemID = item.id;

			item.name = 'Homer';

			this.menuData.updateMenuItem( item );
		} );

		it( 'should update an item name in the internal structure', function() {
			var menu = this.menuData.getMenu( 'primary' );
			expect( find( menu.items, { id: this.itemID } ).name ).to.equal( 'Homer' );
		} );

		it( 'should raise a change event', function() {
			assert( this.changeEventSpy.called, 'Event not fired one time' );
		} );

	} );

	describe( 'moveItemsToParent', function() {
		it( 'should move one item to a different parent', function() {
			var menu = this.menuData.getMenu( 'primary' ),
				itemToMove = menu.items[1].items[0].items[1].items[0],
				itemToMoveTo = menu.items[1].items[1];

			this.menuData.moveItemsToParent( itemToMove, itemToMoveTo );

			menu = this.menuData.getMenu( 'primary' );

			expect( find( menu.items[1].items[1].items, { name: 'Space invader designs' } ) ).to.be.ok;
		} );
	} );

	describe( 'moveItem', function() {

		it( 'should move an item and insert it before a target', function() {
			var menu = this.menuData.getMenu( 'primary' ),
				itemToMove = menu.items[2], // About us
				itemToMoveTo = menu.items[0], // Home
				items;

			this.menuData.moveItem( itemToMove.id, itemToMoveTo.id, 'before' );

			items = this.menuData.getMenu( 'primary' ).items;
			expect( items[0] ).to.have.property( 'name', 'About us' );
			expect( items[1] ).to.have.property( 'name', 'Home' );
			expect( items[2] ).to.have.property( 'name', 'Products' );
		} );

		it( 'should move an item and insert it after a target', function() {
			var menu = this.menuData.getMenu( 'primary' ),
				itemToMove = menu.items[1], // Products
				itemToMoveTo = menu.items[2], // About us
				items;

			this.menuData.moveItem( itemToMove.id, itemToMoveTo.id, 'after' );

			items = this.menuData.getMenu( 'primary' ).items;
			expect( items[0] ).to.have.property( 'name', 'Home' );
			expect( items[1] ).to.have.property( 'name', 'About us' );
			expect( items[2] ).to.have.property( 'name', 'Products' );
		} );

		it( 'should move an item to a different parent', function() {
			var menu = this.menuData.getMenu( 'primary' ),
				// Products > Socks > 80s socks > Space invader designs
				itemToMove = menu.items[1].items[0].items[1].items[0],
				itemToMoveTo = menu.items[2].items[0]; // Location

			this.menuData.moveItem( itemToMove.id, itemToMoveTo.id, 'child' );

			menu = this.menuData.getMenu( 'primary' );
			expect( menu.items[1].items[0].items[1].items ).to.be.empty;
			expect( menu.items[2].items[0].items[0] ).to.have.property( 'name', 'Space invader designs' );
		} );

		it( 'should move subtree of an item', function() {
			var menu = this.menuData.getMenu( 'primary' ),
				itemToMove = menu.items[1], // Products
				itemToMoveTo = menu.items[0], // Home
				items;

			this.menuData.moveItem( itemToMove.id, itemToMoveTo.id, 'before' );
			items = this.menuData.getMenu( 'primary' ).items;
			expect( items[0].items[0] ).to.have.property( 'name', 'Socks' );
		} );

		it ( 'should insert child item as last child', function() {
			var menu = this.menuData.getMenu( 'primary' ),
				// Products > Socks > 80s socks > Space invader designs
				itemToMove = menu.items[1].items[0].items[1].items[0],
				itemToMoveTo = menu.items[2]; // About us

				this.menuData.moveItem( itemToMove.id, itemToMoveTo.id, 'child' );

				menu = this.menuData.getMenu( 'primary' );
				expect( menu.items[2].items[1] ).to.have.property( 'name', 'Space invader designs' );
		} );

		it ( 'should be able to move an item into its own descendent subtree', function() {
			var products = this.menuData.find( { name: 'Products' } ),
				socks = this.menuData.find( { name: 'Socks' } );

			this.menuData.moveItem( products.id, socks.id, 'child' );

			products = this.menuData.find( { name: 'Products' } );
			socks = this.menuData.find( { name: 'Socks' } );

			expect( socks.items ).to.contain( products );
		} );
	} );

	describe( 'parseMenu', function () {
		it( 'should call interceptLoadForHomepageLink', function () {
			var spy = sinon.spy( this.menuData, 'interceptLoadForHomepageLink' ),
				menu = { items: [], description: 'desc', name: 'name' };
			this.menuData.parseMenu( menu );
			expect( spy ).to.have.been.calledWith( menu );
		} );
	});

	describe( 'addItem', function() {
		beforeEach( function() {
			this.changeEventSpy = sinon.spy();
			this.menuData.on( 'change', this.changeEventSpy );

			this.menu = this.menuData.getMenu( 'primary' );
		} );

		context( 'when inserting before an item', function() {
			beforeEach( function() {
				var newItem = { name: 'Newsletter' };
				var products = this.menuData.find( { name: 'Products' } );

				this.menuData.addItem( newItem, products.id, 'before', this.menu.id );
			} );

			it( 'should add the item', function() {
				expect( this.menu.items[1].name ).to.equal( 'Newsletter' );
			} );

			it( 'should raise a change event', function() {
				assert( this.changeEventSpy.called, 'Event not fired one time' );
			} );
		} );

		context( 'when inserting after an item', function() {
			beforeEach( function() {
				var newItem = { name: 'Socks with polka dots' };
				var stripySocks = this.menuData.find( { name: 'Stripy socks' } );

				this.menuData.addItem( newItem, stripySocks.id, 'after', this.menu.id );
			} );

			it( 'should add the item', function() {
				expect( this.menu.items[1].items[0].items[1].name ).to.equal( 'Socks with polka dots' );
			} );

			it( 'should raise a change event', function() {
				assert( this.changeEventSpy.called, 'Event not fired one time' );
			} );
		} );

		context( 'when inserting as a child item', function() {
			beforeEach( function() {
				var newItem = { name: 'The Search for Sock' };
				this.aboutUs = this.menuData.find( { name: 'About us' } );

				this.menuData.addItem( newItem, this.aboutUs.id, 'child', this.menu.id );
			} );

			it( 'should add the item', function() {
				expect( this.aboutUs.items[1] ).to.have.property( 'name', 'The Search for Sock' );
			} );

			it( 'should raise a change event', function() {
				assert( this.changeEventSpy.called, 'Event not fired one time' );
			} );
		} );
	} );

	describe( 'deleteItem', function() {
		beforeEach( function() {
			this.changeEventSpy = sinon.spy();
			this.menuData.on( 'change', this.changeEventSpy );
		} );

		context( 'when the item has no children', function() {
			beforeEach( function() {
				var menu = this.menuData.getMenu( 'primary' ),
					item = menu.items[0];

				this.menuData.deleteMenuItem( item );
			} );

			it( 'should delete the item', function() {
				var menu = this.menuData.getMenu( 'primary' );

				expect( menu.items[0].name ).not.to.equal( 'Home' );
			} );

			it( 'should raise a change event', function() {
				assert( this.changeEventSpy.called, 'Event not fired one time' );
			} );
		} );

		context( 'when the item has children, and is a top level item', function() {
			beforeEach( function() {
				var item = this.menuData.findByName( 'Products' );

				this.menuData.deleteMenuItem( item );
			} );

			it( 'should delete the item', function() {
				expect( this.menuData.findByName( 'Products' ) ).to.be.undefined;
			} );

			it( 'should move the child items to the root level', function() {
				var menu = this.menuData.getMenu( 'primary' ),
				 socks = find( menu.items, { name: 'Socks' } );

				expect( find( menu.items, { name: 'Slippers' } ) ).to.be.ok;
				expect( socks ).to.be.ok;
				expect( find( socks.items, { name: 'Stripy socks' } ) ).to.be.ok;
			} );

			it( 'should raise a change event', function() {
				assert( this.changeEventSpy.called, 'Event not fired one time' );
			} );
		} );

		context( 'when the item has children, and is NOT a top level item', function() {
			beforeEach( function() {
				var item = this.menuData.findByName( 'Socks' );
				this.menuData.deleteMenuItem( item );
			} );

			it( 'should delete the item', function() {
				expect( this.menuData.findByName( 'Socks' ) ).to.be.undefined;
			} );

			it( 'should move the child items to the parent of the deleted parent', function() {
				var item = this.menuData.findByName( 'Products' );

				expect( find( item.items, { name: 'Stripy socks' } ) ).to.be.ok;
				expect( find( item.items, { name: '80s socks' } ) ).to.be.ok;
			} );

			it( 'should raise a change event', function() {
				assert( this.changeEventSpy.called, 'Event not fired one time' );
			} );
		} );
	} );

	describe( 'addMenu', function() {
		beforeEach( function( done ) {
			this.menuData.addMenu( 'Foo', done );
		} );

		it( 'should add a new menu', function() {
			var newName = this.menuData.get().menus[3].name;

			expect( newName ).to.equal( 'Foo' );
		} );
	} );

	describe( 'addNewMenu', function() {
		beforeEach( function() {
			this.menuData.addNewMenu( 'Menu' );
		} );

		it( 'should return an incremented new menu name', function() {
			var newName = this.menuData.get().menus[3].name;

			expect( newName ).to.equal( 'Menu 4' );
		} );

		it( 'should use suffix "1" for first menu', function() {
			var newName;

			this.menuData.data.menus = [];
			this.menuData.addNewMenu( 'Menu' );
			newName = this.menuData.get().menus[0].name;

			expect( newName ).to.equal( 'Menu 1' );
		} );
	} );

	describe( 'deleteMenu', function() {
		beforeEach( function() {
			var menu = this.menuData.getMenu( 'primary' );

			this.changeEventSpy = sinon.spy();
			this.menuData.on( 'change', this.changeEventSpy );

			this.menuData.deleteMenu( menu );
		} );

		it( 'should remove the menu from the list', function() {
			expect( this.menuData.data.menus ).to.have.length.of( 2 );
		} );

		it( 'should raise a change event', function() {
			assert( this.changeEventSpy.called, 'Event not fired one time' );
		} );
	} );

	describe( 'allocateClientIDs', function() {
		it( 'should populate all item.id fields in a menu with new values', function() {
			var originalMenu = fixtures.menusFlat.menus[0],
				menu = this.menuData.allocateClientIDs( cloneDeep( originalMenu ) );

			deepMapValues( menu.items, function( value, propertyPath ) {
				if ( 'id' === last( propertyPath ) ) {
					expect( value ).to.not.equal( get( originalMenu.items, propertyPath ) );
				}
			});
		} );

		it( 'should store original id in server_id field', function() {
			var originalMenu = fixtures.menusFlat.menus[0],
				menu = this.menuData.allocateClientIDs( cloneDeep( originalMenu ) );

			deepMapValues( menu.items, function( value, propertyPath ) {
				if ( 'server_id' === propertyPath.pop() ) {
					propertyPath.push( 'id' );
					expect( value ).to.equal( get( originalMenu.items, propertyPath ) );
				}
			});
		} );

		it( 'should leave the menu\'s own ID untouched', function() {
			var originalMenu = fixtures.menusFlat.menus[0],
				menu = this.menuData.allocateClientIDs( cloneDeep( originalMenu ) );

			expect( menu.id ).to.equal( originalMenu.id );
		} );
	} );

	describe( 'restoreServerIDs', function() {
		it( 'should populate item.id fields with original values', function() {
			var originalMenu = fixtures.menusFlat.menus[0];

			this.menuData.restoreServerIDs( this.menuData.data.menus[0] );

			deepMapValues( this.menuData.data.menus[0].items, function( value, propertyPath ) {
				if ( 'id' === last( propertyPath ) ) {
					expect( value ).to.equal( get( originalMenu.items, propertyPath ) );
				}
			});
		} );

		it( 'should leave the menu\'s own ID untouched', function() {
			var originalMenu = fixtures.menusFlat.menus[0];

			this.menuData.restoreServerIDs( this.menuData.data.menus[0] );

			expect( this.menuData.data.menus[0].id ).to.equal( originalMenu.id );
		} );
	} );

} );
