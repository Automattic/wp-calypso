/**
 * External dependencies
 */
import debugFactory from 'debug';
import assign from 'lodash/assign';
import omit from 'lodash/omit';
import without from 'lodash/without';
import includes from 'lodash/includes';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import cloneDeepWith from 'lodash/cloneDeepWith';
import findIndex from 'lodash/findIndex';
import iteratee from 'lodash/iteratee';
import isArray from 'lodash/isArray';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Emitter from 'lib/mixins/emitter';
import sitesFactory from 'lib/sites-list';
import untrailingslashit from 'lib/route/untrailingslashit';
import trailingslashit from 'lib/route/trailingslashit';
import { isFrontPage } from 'my-sites/pages/helpers';
import Traverser from 'lib/tree-convert/tree-traverser';
import TreeConvert from 'lib/tree-convert';
import { makePromiseSequence } from 'lib/promises';
import { decodeEntities } from 'lib/formatting';
import postEditStore from 'lib/posts/actions';

const debug = debugFactory( 'calypso:menu-data' );
const sites = sitesFactory();
const treeConvert = new TreeConvert();

/**
 * Constants
 */
var DEFAULT_MENU_ID = 0;
var HOMEPAGE_MENU_ITEM_ID = -99;
var NEWPAGE_MENU_ITEM_ID = -100;

export function isInjectedNewPageItem( content ) {
	return content.content_id === NEWPAGE_MENU_ITEM_ID;
}

/**
 * MenuData component
 *
 * @api public
 */
export default function MenuData() {
	this.data = {};
	this.idCounter = 1;
	this.hasContentsChanged = false;
	this.hasAssociationChanged = false;
	sites.on( 'change', this.updateInstance.bind( this ) );
	this.updateInstance();
}

/**
 * Mixins
 */
Emitter( MenuData.prototype );

/**
 * Generates a home page menu item
 * This is used to inject home page item into pages list
 *
 * @param {String} pageNameSuffix - page name suffix
 * @return {Object} object menu builder
 */
MenuData.prototype.generateHomePageMenuItem = function( pageNameSuffix ) {
	return {
		ID: HOMEPAGE_MENU_ITEM_ID,
		content_id: HOMEPAGE_MENU_ITEM_ID,
		url: trailingslashit( this.site.URL ),
		name: i18n.translate( 'Home' ) + ( pageNameSuffix ? ': ' + pageNameSuffix : '' ),
		type: 'page',
		type_family: 'post_type',
		tags: [ i18n.translate( 'site' ) ],
		status: 'publish'
	};
};

MenuData.prototype.generateNewPageMenuItem = function() {
	return {
		ID: NEWPAGE_MENU_ITEM_ID,
		content_id: NEWPAGE_MENU_ITEM_ID,
		url: trailingslashit( this.site.URL ),
		name: i18n.translate( 'Create a new page for this menu item' ),
		type: 'page',
		type_family: 'post_type',
		tags: [],
		status: 'publish'
	};
};

/**
 * Updates internal state concerning the currently selected site. Is triggered
 * whenever the site changes to make sure the state is up-to-date, and resets
 * internal variables that are site-specific.
 */
MenuData.prototype.updateInstance = function() {
	var site = sites.getSelectedSite();

	if ( site && site.ID !== this.siteID ) {
		debug( 'site changed, fetching data...' );
		this.siteID = site.ID;
		this.site = site;

		// prevent use of stale data
		this.data = {};

		this.fetch();
	}
};

/**
 * Get menu data from current object
 *
 * @return {Object} menu data
 * @api public
 */
MenuData.prototype.get = function() {
	return {
		locations: this.data.locations,
		menus: this.data.menus,
		hasDefaultMenu: this.data.defaultMenu !== false,
		hasContentsChanged: this.hasContentsChanged,
		hasAssociationChanged: this.hasAssociationChanged,
		hasChanged: this.hasContentsChanged || this.hasAssociationChanged
	};
};

/**
 * Fetch the menu data from the user's site via the WordPress.com REST API.
 *
 * @api public
 */
MenuData.prototype.fetch = function() {
	var requestedSiteID = this.siteID;

	wpcom.undocumented().menus( this.siteID, ( error, data ) => {
		if ( error ) {
			this.emit( 'error', i18n.translate( 'There was a problem fetching your menu data.' ) );
			debug( 'Error', error, data );
		}

		// Bail if site has changed in the meantime
		if ( requestedSiteID !== this.siteID ) {
			return;
		}

		debug( 'Raw data:', data );

		this.data = this.parse( data );

		debug( 'Parsed data:', this.data );
		this.change( { reset: true } );
	} );
};

/**
 * Parse data returned from the API
 *
 * @param {Object} data - rest-api response date
 * @return {Object} locations, menus
 **/
MenuData.prototype.parse = function( data ) {
	if ( ! data.locations.length ) {
		this.emit(
			'error',
			i18n.translate( 'There must be at least one location for a menu in your theme.' )
		);
	}

	return {
		locations: data.locations.map(
				this.decodeProperties.bind(
						this, ['name', 'description'] )
				),
		menus: data.menus.map( this.parseMenu, this )
	};
};

/**
 * Parse a menu returned from the API
 *
 * @param {Object} menu - rest-api response data
 * @return {Object} parsed menu
 */
MenuData.prototype.parseMenu = function( menu ) {
	menu = this.allocateClientIDs( menu );
	menu = this.decodeProperties( ['description'], menu );
	menu = Traverser.traverse( menu, [ function( item ) {
		return this.decodeProperties( ['name'], item );
	}.bind( this ) ] );
	menu = this.interceptLoadForHomepageLink( menu );

	return menu;
};

/**
 * Emits a change event and, by default, sets state to mark the presence of
 * unsaved changes to the MenuData data structure.
 *
 * @param {object} options:
 * - reset (boolean): if true, unsets all change flags
 * - associationOnly (boolean): if true, only sets association change flag and unsets contents change flag
 * - menuID (int): ID of the menu being changed. Will be used if save() is called without an ID.
 *
 * @api private
 */
MenuData.prototype.change = function( options ) {
	options = options || {};
	this.hasContentsChanged = ! options.reset && ! options.associationOnly;
	this.hasAssociationChanged = options.associationOnly;
	this.lastChangedMenuID = options.menuID;
	this.emit( 'change' );
};

/**
 * Discards any unsaved changes in the data structure. Once done, emits both
 * 'change' and 'saved'.
 */
MenuData.prototype.discard = function() {
	this.once( 'change', function() {
		this.emit( 'saved' );
	}, this );
	this.fetch();
};

/**
 * Checks whether there are unsaved contents changes before performing a
 * certain action. If there are unsaved changes, check whether they should be
 * discarded (e.g. via user prompt) and, if so, perform the action afterwards.
 *
 * @param {Function} shouldDiscard - should return a boolean
 * @param {Function} action - action function
 */
MenuData.prototype.ensureContentsSaved = function( shouldDiscard, action ) {
	if ( this.hasContentsChanged ) {
		if ( shouldDiscard() ) {
			this.once( 'saved', action );
			this.discard();
		}
	} else {
		action();
	}
};

/**
 * Restore original server ids to the item.id field.
 *
 * @param {object} menu – a tree-structured menu
 */
MenuData.prototype.restoreServerIDs = function( menu ) {
	if ( ! ( 'items' in menu ) || ! Array.isArray( menu.items ) ) {
		return;
	}

	menu.items.forEach( function( it ) {
		Traverser.traverse( it, [ function( node ) {
			if ( node.server_id ) {
				node.id = node.server_id;
			} else {
				delete node.id;
			}
			return node;
		} ] );
	} );
};

/**
 * Replace item.id field with client generated values, allowing
 * ids to be allocated to new items using the same numbering scheme.
 *
 * Stash the original ids in the 'server_id' field so that they can
 * be restored prior to a save.
 *
 * @param {object} menu – a tree-structured menu
 * @return {object} menu
 */
MenuData.prototype.allocateClientIDs = function( menu ) {
	if ( ! ( 'items' in menu ) || ! Array.isArray( menu.items ) ) {
		return menu;
	}

	menu.items.forEach( function( it ) {
		Traverser.traverse( it, [ function( item ) {
			item.server_id = item.id;
			item.id = this.idCounter++;
			return item;
		}.bind( this ) ] );
	}, this );
	return menu;
};

/**
 * Entity-decode an object's properties.
 *
 * @param {Array} properties - names of the object properties to entity-decode
 * @param {Object} obj - object whose properties to entity-decode
 * @return {Object} decoded properties
 */
MenuData.prototype.decodeProperties = function( properties, obj ) {
	// 'undefined' makes 'cloneDeep' use it's own cloning method vs the value returned here
	return cloneDeepWith( obj, ( value, key ) => (
		includes( properties, key ) ? decodeEntities( value ) : undefined
	) );
};

/**
 * Predicates
 */

MenuData.prototype.isValidMenu = function( menu ) {
	return menu && this.find( { id: menu.id }, this.data.menus );
};

/**
 * Getters
 */

MenuData.prototype.getPrimaryLocation = function( ) {
	var primaryLocation;

	if ( ! this.data.locations || ! this.data.locations[0] ) {
		return false;
	}

	primaryLocation = find( this.data.locations, { name: 'primary' } );
	return ( primaryLocation || this.data.locations[0] ).name;
};

MenuData.prototype.getMenu = function( locationName ) {
	var menu;

	if ( ! this.data.menus ) {
		return null;
	}

	menu = find( this.data.menus, function( _menu ) {
		return includes( _menu.locations, locationName );
	} );

	return menu || null;
};

/**
 * Actions
 */

/**
 * Converts page items with HOMEPAGE_MENU_ITEM_ID
 * to links since they are stored as links in WP.
 * This function should be called before saving a menu to WP API.
 * @param {Object} menu instance
 * @returns {*} menu
 */
MenuData.prototype.interceptSaveForHomepageLink = function( menu ) {
	var site = this.site;
	menu.items.filter( function( item ) {
		return item.type === 'page' && item.content_id === HOMEPAGE_MENU_ITEM_ID;
	} ).forEach( function( item ) {
		item.type = 'custom';
		item.type_family = 'custom';
		item.url = trailingslashit( site.URL );
	} );
	return menu;
};

/**
 * Converts links directing to home page url to page items with HOMEPAGE_MENU_ITEM_ID
 * This function should be called after loading a menu from WP API.
 * @param {Object} menu instance
 * @returns {*} menu
 */
MenuData.prototype.interceptLoadForHomepageLink = function( menu ) {
	var site = this.site;
	menu.items.filter( function( item ) {
		return item.type === 'custom' &&
			untrailingslashit( item.url ) === untrailingslashit( site.URL );
	} ).forEach( function( item ) {
		item.type = 'page';
		item.type_family = 'post_type';
		item.content_id = HOMEPAGE_MENU_ITEM_ID;
	} );
	return menu;
};

MenuData.prototype.createNewPagePromise = ( menuItem, siteID ) => new Promise(
	( resolve, reject ) => {
		postEditStore.startEditingNew( siteID );
		postEditStore.saveEdited(
			{
				title: menuItem.name,
				ID: 'new',
				type: 'page',
				status: 'publish',
			},
			( error, data ) => {
				postEditStore.stopEditing();
				if ( ! error && data ) {
					menuItem.url = data.URL;
					menuItem.content_id = data.ID;
					resolve();
					return;
				}
				reject( error );
			}
		);
	}
);

MenuData.prototype.sendMenuToApi = function( menu, callback ) {
	this.emit( 'saving' );
	wpcom
	.undocumented()
	.menusUpdate(
		this.siteID,
		menu.id,
		this.interceptSaveForHomepageLink( menu ),
		( error, data ) => {
			if ( error ) {
				this.emit( 'error', i18n.translate( 'There was a problem saving your menu.' ) );
				debug( 'Error', error, data );
				return;
			}

			// The response will contain server-allocated
			// IDs for newly created items
			const parsedMenu = this.parseMenu( data.menu );
			parsedMenu.lastSaveTime = Date.now();
			this.replaceMenu( parsedMenu );

			this.change( { reset: true } );
			this.emit( 'saved' );
			callback && callback( null, parsedMenu );
		}
	);
};

MenuData.prototype.saveMenu = function( menu, callback ) {
	if ( ! menu ) {
		menu = this.find( { id: this.lastChangedMenuID } );
	}

	if ( ! this.isValidMenu( menu ) ) {
		callback && callback( new Error( 'Invalid menu' ) );
		debug( 'saveMenu: fail' );
		return;
	}

	menu = cloneDeep( menu );

	if ( menu.id === this.getDefaultMenuId() ) {
		return this.saveDefaultMenu();
	}

	this.restoreServerIDs( menu );

	debug( 'saveMenu', menu );

	/**
	 * Below, we check for any new pages that need to be created. The post edit
	 * store requires this process to be sequential, so we build a chain of
	 * promises, each of them responsible for the creation of a page.
	 */

	const pendingPageItems = treeConvert
		.untreeify( menu.items )
		.filter( isInjectedNewPageItem );

	const createdPages = makePromiseSequence(
			pendingPageItems,
			item => this.createNewPagePromise( item, this.siteID )
	);

	createdPages.catch( error => {
		this.emit( 'error', i18n.translate( 'There was a problem saving your menu.' ) );
		debug( 'Error', error );
	} ).then( this.sendMenuToApi.bind( this, menu, callback ) );
};

MenuData.prototype.deleteMenu = function( menu, callback ) {
	var menuIndex, menusBackup;

	if ( ! this.isValidMenu( menu ) ) {
		this.emit( 'error', i18n.translate( "This menu is invalid and can't be deleted." ) );
		callback && callback( new Error( 'Invalid menu' ) );
		return false;
	}

	menusBackup = this.data.menus.slice();
	menuIndex = findIndex( this.data.menus, { id: menu.id } );
	this.deletedMenu = this.data.menus.splice( menuIndex, 1 )[0];

	this.emit( 'change' );
	this.emit( 'saving' );

	wpcom
	.undocumented()
	.menusDelete( this.siteID, menu.id, ( error, data ) => {
		if ( error || ( data && ! data.deleted ) ) {
			this.data.menus = menusBackup;
			this.emit( 'error', i18n.translate( "Sorry, we couldn't delete this menu." ) );
			this.emit( 'change' );
			callback && callback( new Error( 'Error deleting menu' ) );
			return;
		} else if ( ! this.lastChangedMenuID ) {
			// there is no menu to save, so clear unsaved changes flag
			this.change( { reset: true } );
		}

		callback && callback( null, data );
		this.emit( 'saved' );
	} );
};

/**
 * @param {String} location - location to restore the menu to
 * @param {Function} [callback] - callback function
 */
MenuData.prototype.restoreMenu = function( location, callback ) {
	var menu;

	if ( this.deletedMenu === undefined ) {
		debug( 'No menu to restore' );
		callback && callback( new Error( 'No menu to restore' ) );
		return;
	}

	menu = this.clearIDs( this.deletedMenu );
	this.allocateClientIDs( menu );

	delete this.deletedMenu;

	this.addMenu( menu.name, function( error, addedMenu ) {
		if ( error ) {
			debug( 'restoreMenu: fail' );
			callback && callback( new Error( 'Failed to restore menu' ) );
			return;
		}

		this.setMenuAtLocation( addedMenu.id, location, {
			associationOnly: false
		} );

		this.saveMenu( addedMenu, callback );
	}.bind( this ), menu );
};

MenuData.prototype.clearIDs = function( menu ) {
	return Traverser.traverse( menu, [ function( item ) {
		return omit( item, ['id', 'server_id'] );
	} ] );
};

MenuData.prototype.setMenuName = function( menuId, name ) {
	var menu = find( this.data.menus, { id: menuId } );

	if ( menu && name ) {
		menu.name = name;
		this.change();
	} else {
		// Invalid setting. Emit event so UI can reset to current value
		this.emit( 'change' );
	}
};

/**
 * @param {number} menuId - 0 represents No Menu / Default
 * @param {string} locationName - location name
 * @param {object} changeOpts [optional] change flags to pass to the #change call
 * @return {*} menu
 */
MenuData.prototype.setMenuAtLocation = function( menuId, locationName, changeOpts ) {
	var location = find( this.data.locations, { name: locationName } ),
		previousMenu,
		previousMenuId,
		menu;

	if ( ! location ) {
		return false;
	}

	previousMenu = find( this.data.menus, function( itemMenu ) {
		return includes( itemMenu.locations, locationName );
	} );

	if ( previousMenu ) {
		previousMenu.locations = without( previousMenu.locations, locationName );
	}

	menu = find( this.data.menus, { id: menuId } );
	if ( menu && this.isValidMenu( menu ) ) {
		menu.locations.push( locationName );
	}

	// The first time a menu is removed from a location, stash
	// the id so that we can save the correct menu if save is
	// finally performed on default/no menu.
	//
	// this.lastChangedMenuID is cleared during reset changes, like fetches
	// (discards) and successful saves
	if ( previousMenu ) {
		previousMenuId = previousMenu.id;
	}

	this.change( assign( {
		associationOnly: true,
		menuID: this.lastChangedMenuID || previousMenuId
	}, changeOpts ) );
};

MenuData.prototype.updateMenuItem = function( newItem ) {
	this.replaceItem( { id: newItem.id }, newItem );
	this.change();
};

MenuData.prototype.moveItem = function( sourceId, targetId, position ) {
	this.data.menus.some( function( menu, i ) {
		var source = this.find( { id: sourceId }, menu.items ),
			target = this.find( { id: targetId }, menu.items );

		if ( undefined !== source && undefined !== target ) {
			if ( this.isAncestor( source, target ) ) {
				// Special case – moving an item into the subtree below itself:
				// Cut it out of the destination subtree before the move by moving
				// its children up a level.
				let parent = Traverser.parent( source, menu );
				this.moveItemsToParent( source.items, parent, { silent: true } );
			}

			// Traverse items tree to remove & reattach 'item'
			this.data.menus[i] = Traverser.traverse( menu, [
				Traverser.remover( source.id ),
				Traverser.inserter( source, target.id, position )
			] );

			this.change();
			return true;
		}
	}, this );
};

MenuData.prototype.getParent = function( itemId ) {
	var parent;

	this.data.menus.some( function( menu ) {
		var node = this.find( { id: itemId }, [ menu ] );
		if ( node ) {
			parent = Traverser.parent( node, menu );
			return !! findIndex( parent.items, { id: itemId } );
		}
	}, this );

	return parent;
};

MenuData.prototype.getPreviousSibling = function( item, parent ) {
	var index = findIndex( parent.items, item );
	if ( index ) {
		return parent.items[ index - 1 ];
	}
};

/**
 * Returns true if an item has sibling items after it in the list
 *
 * @param {*} item - menu item
 * @param {*} parent - parent
 * @return {Boolean} has sibling
 */
MenuData.prototype.hasSubsequentSiblings = function( item, parent ) {
	var index = findIndex( parent.items, item );
	return index >= 0 && index < parent.items.length - 1;
};

/**
 * Returns the first item found that matches the provided criterion. This
 * method is similar to Lo-Dash's 'find', in that 'criterion' can be:
 * - a predicate to test each item
 * - an object of key/val pairs, e.g. { id: 42 }
 * - a string to perform a 'pluck'-style find, e.g. 'id'
 *
 * @param {Function|Object|String} criterion - criterion
 * @param {Array} menus - menus array
 * @return {object} item
 */
MenuData.prototype.find = function( criterion, menus ) {
	var predicate = iteratee( criterion ),
		i, result;

	menus = menus || this.data.menus;

	for ( i = 0; i < menus.length; i++ ) {
		if ( result = Traverser.find( menus[i], predicate ) ) { // eslint-disable-line no-cond-assign
			return result;
		}
	}
};

MenuData.prototype.findByName = function( name ) {
	return this.find( { name: name } );
};

MenuData.prototype.replaceItem = function( criterion, newItem, menus ) {
	var predicate = iteratee( criterion ), i;

	menus = menus || this.data.menus;

	for ( i = 0; i < menus.length; i++ ) {
		Traverser.replaceItem( menus[i], newItem, predicate );
	}
};

/**
 * Moves a single, or an array of items to a specified parent.
 *
 * @param {Array|Object} uiItems - a single item, or an array of items to move
 * @param {Number|Object} parent - a parent item object
 * @param {Object} options - include 'silent: true' property to silence change events
 */
MenuData.prototype.moveItemsToParent = function( uiItems, parent, options ) {
	var hasChanged;

	options = options || {};

	if ( ! Array.isArray( uiItems ) ) {
		uiItems = [ uiItems ];
	}

	uiItems.forEach( function( uiItem ) {
		this.data.menus.some( function( menu ) {
			var item = this.find( { id: uiItem.id }, menu.items );
			if ( undefined !== item ) {
				let oldParent = Traverser.parent( uiItem, menu );
				oldParent.items = without( oldParent.items, item );

				if ( ! Array.isArray( parent.items ) ) {
					parent.items = [ item ];
				} else {
					parent.items.push( item );
				}
				hasChanged = true;
				return true;
			}
		}, this );
	}, this );

	if ( hasChanged && ! options.silent ) {
		this.change();
	}
};

MenuData.prototype.deleteMenuItem = function( uiItem ) {
	this.data.menus.some( function( menu ) {
		var item = this.find( { id: uiItem.id }, menu.items );

		if ( undefined !== item ) {
			let parent = Traverser.parent( uiItem, menu );

			if ( uiItem.items ) {
				this.moveItemsToParent( uiItem.items, parent, { silent: true } );
			}

			parent.items = without( parent.items, item );
			this.change();
			return true;
		}
	}, this );
};

/**
 * @param {object} item - the item to add
 * @param {int} targetId - target identifier
 * @param {string} position - 'before' | 'after' | 'child' | 'first'
 * @param {int} menuId - id of the menu to add to
 */
MenuData.prototype.addItem = function( item, targetId, position, menuId ) {
	item.id = this.idCounter++;

	this.data.menus.some( function( menu, i ) {
		var target;

		if ( menu.id !== menuId ) {
			return;
		}

		target = this.find( { id: targetId }, [ menu ] );
		if ( target ) {
			menu = Traverser.traverse( menu, [
				Traverser.inserter( item, target.id, position )
			] );
		} else {
			// Empty menu
			menu.items = [ item ];
		}

		this.data.menus[i] = menu;
		this.change();
		return true;
	}, this );
};

/**
 * Adds a new menu
 *  - Increments the default menu string, e.g. 'Menu 1' -> 'Menu 2'
 *  - Switches to the new menu, when we have a menu ID for it
 *
 * @param {string} selectedLocation selected location
 */
MenuData.prototype.addNewMenu = function( selectedLocation ) {
	this.addMenu( this._incrementMenuName( this.data.menus ), ( error, menu ) => {
		if ( error ) {
			return;
		}
		this.setMenuAtLocation( menu.id, selectedLocation );
	} );
};

/**
 * Adds a menu
 *
 * @param {string} name - menu name
 * @param {function} callback - returns menu object with new id assigned from server
 * @param {object} attributes [optional] - attributes for the new menu
 */
MenuData.prototype.addMenu = function( name, callback, attributes ) {
	var newMenu = assign( {
		name: name,
		items: [],
		locations: []
	}, attributes );

	wpcom
	.undocumented()
	.menusUpdate( this.siteID, 0, newMenu, ( error, data ) => {
		if ( ! error && data.id ) {
			newMenu.id = data.id;
			this.data.menus.push( newMenu );
			debug( 'new menu', newMenu );
			this.emit( 'change' );
			callback && callback( null, newMenu );
		} else {
			this.emit( 'error', i18n.translate( "Sorry, we couldn't create this menu." ) );
			debug( 'error creating menu', error );
			callback && callback( error );
		}
	} );
};

// FIXME: this just appends ASCII numerals to the end of the string,
// and does not account for RTL, or language specific numeric characters.
MenuData.prototype._incrementMenuName = function( menus ) {
	var menuString = i18n.translate( 'Menu' ),
		deletedMenus = this.deletedMenu ? [ this.deletedMenu ] : [],
		menuNumbers = menus.concat( deletedMenus ).map( function( menu ) {
			var matches;
			if ( matches = menu.name.match( RegExp( '^' + menuString + ' (\\d+)$' ) ) ) { // eslint-disable-line no-cond-assign
				return Number( matches[1] );
			}
			return 0;
		} );

	// Ensure we pass at least one value to max()
	menuNumbers.push( 0 );
	return menuString + ' ' + ( Math.max.apply( Math, menuNumbers ) + 1 );
};

MenuData.prototype.isAncestor = function( ancestor, descendent ) {
	if ( ancestor.id === descendent.id ) {
		return false;
	}
	return !! Traverser.find( ancestor, function( node ) {
		return node && node.id === descendent.id;
	} );
};

MenuData.prototype.replaceMenu = function( newMenu ) {
	this.data.menus.some( function( menu, i ) {
		if ( menu.id === newMenu.id ) {
			this.data.menus[i] = newMenu;
			debug( 'replaced menu', this.data.menus[i] );
			return true;
		}
	}, this );
};

/**
 * Default Menu extensions
 *
 * The DM is a menu made up of a site's top-level pages.
 *
 * Once it has been generated, there are two references to it: one at
 * `this.data.defaultMenu`, the other as an element of `this.data.menus`. The
 * DM is the only one with an ID of 0.
 *
 * The former reference is kept for ease of access and existence check; the
 * latter is kept so that MenuData and the UI can treat it as a regular
 * menu.
 */

MenuData.prototype.getDefaultMenuId = function() {
	return DEFAULT_MENU_ID;
};

MenuData.prototype.hasDefaultMenu = function() {
	return this.data.defaultMenu && this.data.defaultMenu.id === this.getDefaultMenuId();
};

MenuData.prototype.getDefaultMenu = function() {
	if ( this.data.defaultMenu ) {
		return this.data.defaultMenu;
	}

	! this.fetchingDefaultMenu && this.fetchDefaultMenu();
};

/**
 * Retrieves a site's top-level pages.
 *
 * Delegates construction of menu to #setDefaultMenu.
 */
MenuData.prototype.fetchDefaultMenu = function() {
	var requestedSiteID = this.siteID,
		params = {
			siteID: this.siteID,
			type: 'page',
			search: '',
			parent_id: 0,
			status: 'publish',
			order: 'ASC',
			order_by: 'title'
		};

	if ( ! requestedSiteID || ! this.data.menus ) {
		debug( 'Site or menu data not loaded yet, not fetching default menu' );
		return;
	}

	this.data.defaultMenu = false;
	this.fetchingDefaultMenu = true;

	wpcom
	.site( requestedSiteID )
	.postsList( params, ( error, data ) => {
		this.fetchingDefaultMenu = false;
		if ( error ) {
			this.emit( 'error', i18n.translate( 'There was a problem loading the default menu.' ) );
			debug( 'Error', error, data );
			return;
		}

		// Bail if site has changed in the meantime
		if ( requestedSiteID !== this.siteID ) {
			return;
		}

		this.setDefaultMenu( data.posts );
	} );
};

/**
 * Builds a menu based on `pages`.
 *
 * @param {array} pages - array of post objects
 */
MenuData.prototype.setDefaultMenu = function( pages ) {
	var items = [],
		site = sites.getSelectedSite(),
		isDefaultMenuSet = !! this.data.defaultMenu;

	pages.forEach( function( page ) {
		var item = {
			name: page.title,
			type: 'page',
			type_family: 'post_type',
			content_id: page.ID,
			items: []
		};

		if ( isFrontPage( page, site ) ) {
			item.name = i18n.translate( 'Home' );
			items.unshift( item );
		} else {
			items.push( item );
		}
	} );

	this.data.defaultMenu = this.parseMenu( {
		id: 0,
		name: i18n.translate( 'Default Menu' ),
		description: '',
		items: items,
		locations: [ this.getPrimaryLocation() ]
	} );
	if ( ! isDefaultMenuSet ) {
		this.data.menus.unshift( this.data.defaultMenu );
	}
	this.emit( 'change' );
};

/**
 * Handles the specific case of saving a default menu.
 *
 * Saving entails one of two cases:
 *
 * - If the default menu hasn't been touched since its generation, this only
 *   saves the location-menu association, which is done by unsetting that
 *   location from any "real" menus.
 *
 * - If it has been touched, materialize the default menu into an actual menu,
 *   with a server-issued ID and a new name. It becomes a "dumb" menu that no
 *   longer reflects a site's top-level pages.
 */
MenuData.prototype.saveDefaultMenu = function() {
	var newMenu;

	if ( ! this.hasContentsChanged ) {
		// Make sure we're not switching _back_ to the default menu after
		// cycling through other menus, lest we fall into mutual recursion.
		if ( this.lastChangedMenuID > 0 ) {
			this.saveMenu();
		}

		// We're done for now, no need for a server save.
		// Use setTimeout to make it look like the save button actually did
		// something.
		setTimeout( function() {
			this.emit( 'saved' );
			this.change( { reset: true } );
		}.bind( this ), 500 );
		return;
	}

	// Create a new menu. Once done, save local changes.
	newMenu = cloneDeep( omit( this.data.defaultMenu, 'id' ) );
	this.addMenu( newMenu.name, this.onDefaultMenuSaved.bind( this ), newMenu );
};

/**
 * Called once the menu has been created on the server, this erases traces of
 * the previously generated default menu and updates the local recently created
 * menu (update name and set location-menu association).
 *
 * @param {Object} error - rest-api error response
 * @param {Object} menu - rest-api menu data response
 */
MenuData.prototype.onDefaultMenuSaved = function( error, menu ) {
	if ( menu && menu.id ) {
		this.deleteDefaultMenu();

		// Rename 'Default Menu' to 'Menu n' unless user has changed it
		if ( menu.name === i18n.translate( 'Default Menu' ) ) {
			menu.name = this._incrementMenuName( this.data.menus );
		}

		menu.locations = [ this.getPrimaryLocation() ];
		this.saveMenu( menu );
	} else {
		debug( 'onDefaultMenuSaved: fail', error );
	}
};

/**
 * Remove any traces of the interim default menu that was used before it was
 * saved on the server, so that the user can at any time select "Default Menu"
 * from the picker again and expect the same behavior as before.
 */
MenuData.prototype.deleteDefaultMenu = function() {
	var index = this.data.menus.indexOf( this.data.defaultMenu );
	if ( ~ index ) {
		this.data.menus.splice( index, 1 );
		delete this.data.defaultMenu;
	}
};

