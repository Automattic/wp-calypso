/**
 * External dependencies
 */
var page = require( 'page' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	route = require( 'lib/route' ),
	KeyboardShortcuts = require( 'lib/keyboard-shortcuts' );

module.exports = GlobalShortcuts;

/**
 * This class accepts a sites-list collection and binds KeyboardShortcuts events to methods that change
 * the route based on which keyboard shortcut was triggered.
 */
function GlobalShortcuts( sites ) {
	if ( ! ( this instanceof GlobalShortcuts ) ) {
		return new GlobalShortcuts( sites );
	}

	this.sites = sites;

	this.bindShortcuts();
}

GlobalShortcuts.prototype.bindShortcuts = function() {
	KeyboardShortcuts.on( 'go-to-reader', this.goToReader.bind( this ) );
	KeyboardShortcuts.on( 'go-to-my-likes', this.goToMyLikes.bind( this ) );
	KeyboardShortcuts.on( 'go-to-stats', this.goToStats.bind( this ) );
	KeyboardShortcuts.on( 'go-to-blog-posts', this.goToBlogPosts.bind( this ) );
	KeyboardShortcuts.on( 'go-to-pages', this.goToPages.bind( this ) );

	if ( config.isEnabled( 'devdocs' ) ) {
		KeyboardShortcuts.on( 'go-to-dev-docs', this.goToDevDocs.bind( this ) );
	}
};

GlobalShortcuts.prototype.goToReader = function() {
	page( '/' );
};

GlobalShortcuts.prototype.goToMyLikes = function() {
	page( '/activities/likes' );
};

GlobalShortcuts.prototype.goToStats = function() {
	var site = this.sites.getSelectedSite();

	if ( site && site.capabilities && ! site.capabilities.view_stats ) {
		return null;
	} else if ( site && site.slug ) {
		page( route.getStatsDefaultSitePage( site.slug ) );
	} else {
		page( '/stats' );
	}
};

GlobalShortcuts.prototype.goToBlogPosts = function() {
	var site = this.sites.getSelectedSite();

	if ( site && site.capabilities && ! site.capabilities.edit_posts ) {
		return null;
	} else if ( site && site.slug ) {
		page( '/posts/my/' + site.slug );
	} else {
		page( '/posts/my' );
	}
};

GlobalShortcuts.prototype.goToPages = function() {
	var site = this.sites.getSelectedSite();

	if ( site && site.capabilities && ! site.capabilities.edit_pages ) {
		return null;
	} else if ( site && site.slug ) {
		page( '/pages/' + site.slug );
	} else {
		page( '/pages' );
	}
};

GlobalShortcuts.prototype.goToDevDocs = function() {
	page( '/devdocs' );
};
