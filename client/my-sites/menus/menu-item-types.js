/**
 * External dependencies
 */
var find = require( 'lodash/find'),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var sites = require( 'lib/sites-list' )(),
	postTypes = require( 'lib/post-types-list' )(),
	Emitter = require( 'lib/mixins/emitter' ),
	TagsList = require( 'lib/tags-list' ),
	debug = require( 'debug' )( 'calypso:menus:menu-item-types' ); // eslint-disable-line no-unused-vars

/**
 * Singleton instance for export
 */
var instance;

/**
 * MenuItemTypes constructor
 *
 * @api public
 */
function MenuItemTypes() {
	if ( ! ( this instanceof MenuItemTypes ) ) {
		return new MenuItemTypes();
	}

	postTypes.on( 'change', this.parse.bind( this ) );

	sites.on( 'change', function() {
		var site = sites.getSelectedSite(),
			currentSiteID = this.site && this.site.ID;

		if ( site && site.ID !== currentSiteID ) {
			debug( 'Site changed, clearing data' );
			this.init( site );
		}
	}.bind( this ) );

	if ( sites.fetched ) {
		this.init( sites.getSelectedSite() );
	}
}

/**
 * Mixins
 */
Emitter( MenuItemTypes.prototype );

MenuItemTypes.prototype.init = function( site ) {
	this.data = [];

	if ( ! site ) {
		return;
	}

	this.site = site;
	this.fetched = false;
	this.initializeDefaultTypes();
	this.fetch();
};

/**
 * Returns an array of default item types
 *
 * @return {array} itemTypes
 */
MenuItemTypes.prototype.initializeDefaultTypes = function() {
	this._defaultItemTypes = [
			{
				name: 'page',
				family: 'post_type',
				icon: 'document',
				renderer: 'renderPostOptions',
				show: true,
				label: i18n.translate( 'Page' ),
				createLink: '//wordpress.com/page/' + this.site.ID  + '/new',
				gaEventLabel: 'Page'
			},
			{
				name: 'custom',
				family: 'custom',
				icon: 'link',
				renderer: 'renderLinkOptions',
				show: true,
				label: i18n.translate( 'Link' ),
				gaEventLabel: 'Link'
			},
			{
				name: 'category',
				family: 'taxonomy',
				icon: 'category',
				renderer: 'renderCategoryOptions',
				show: true,
				label: i18n.translate( 'Category' ),
				createLink: this.site.options.admin_url + 'edit-tags.php?taxonomy=category',
				gaEventLabel: 'Category'
			},
			{
				name: 'post_tag',
				family: 'taxonomy',
				icon: 'tag',
				contentsList: new TagsList( this.site.ID ),
				renderer: 'renderTaxonomyOptions',
				show: true,
				label: i18n.translate( 'Tag' ),
				createLink: this.site.options.admin_url + 'edit-tags.php?taxonomy=post_tag',
				gaEventLabel: 'Tag'
			},
			{
				name: 'post_format',
				family: 'taxonomy',
				icon: 'summary',
				renderer: 'renderTaxonomyContents',
				show: false,
				label: i18n.translate( 'Post Format' ),
				gaEventLabel: 'Post Format'
			},
			{
				name: 'post',
				family: 'post_type',
				icon: 'standard',
				renderer: 'renderPostOptions',
				show: true,
				label: i18n.translate( 'Post' ),
				createLink: '//wordpress.com/post/' + this.site.ID  + '/new',
				gaEventLabel: 'Post'
			}
	];
};

/**
 * Gets a list of item types for the current site
 *
 * It'll always return the default item types, with any CPTs appended to the tail of the array
 *
 * @return {array} itemTypes
 */
MenuItemTypes.prototype.get = function() {
	if ( ! this.site ) {
		return [];
	}
	return this._defaultItemTypes.concat( this.data );
};

/**
 * Initiate a fetch of the current site's post types
 */
MenuItemTypes.prototype.fetch = function() {
	var types;

	debug( 'Fetching post types' );

	types = postTypes.get( this.site.ID );

	if ( types.length > 0 ) {
		this.parse(); // Already have types, parse straight away
	}
};

/**
 * Parses the data obtained from postTypes, and decides whether to add them to the item types list
 */
MenuItemTypes.prototype.parse = function() {
	var newTypes, types = postTypes.get( this.site.ID );

	debug( 'Parsing post types', types );
	this.fetched = true;

	newTypes = types.filter( function( type ) {
		return find( this._defaultItemTypes, { name: type.name } ) === undefined &&
				type.api_queryable === true &&
				type.map_meta_cap === true;
	}, this );

	debug( 'Found some new types', newTypes );

	newTypes.forEach( function( type ) {
		this.data.push( {
			name: type.name,
			family: 'post_type',
			icon: 'standard',
			renderer: 'renderPostOptions',
			show: true,
			label: type.label, //FIXME: how do we handle i18n here?
			createLink: this.site.options.admin_url + 'post-new.php?post_type=' + type.name,
			gaEventLabel: type.label
		} );
	}, this );

	this.emit( 'change' );
};

instance = new MenuItemTypes();

module.exports = instance;
