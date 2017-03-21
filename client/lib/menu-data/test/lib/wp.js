/**
 * Stub wp module to avoid its dependency on the browser and supply fixture data
 **/

var fixtures = require( '../fixtures' ),
	cloneDeep = require( 'lodash/cloneDeep' );

function WP() {
}

WP.prototype.undocumented = function() {
	return this;
};

WP.prototype.menus = function( siteId, callback ) {
	return callback( 0, cloneDeep( fixtures.menusFlat ) ); // get
};

WP.prototype.menusUpdate = function( siteId, menuId, data, callback ) {
	return callback( null, { id: 3 } ); // new menu
};

WP.prototype.menusDelete = function( siteId, menuId, callback ) {
	return callback( null, { deleted: true } );
};

export default new WP();
