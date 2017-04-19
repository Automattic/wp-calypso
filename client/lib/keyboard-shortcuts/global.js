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

let singleton;

export default function() {
	if ( ! singleton ) {
		singleton = new GlobalShortcuts();
	}
	return singleton;
}

function GlobalShortcuts() {
	if ( ! ( this instanceof GlobalShortcuts ) ) {
		return new GlobalShortcuts();
	}

	this.selectedSite = null;
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

GlobalShortcuts.prototype.setSelectedSite = function( site ) {
	this.selectedSite = site;
};

GlobalShortcuts.prototype.goToReader = function() {
	page( '/' );
};

GlobalShortcuts.prototype.goToMyLikes = function() {
	page( '/activities/likes' );
};

GlobalShortcuts.prototype.goToStats = function() {
	const site = this.selectedSite;

	if ( site && site.capabilities && ! site.capabilities.view_stats ) {
		return null;
	} else if ( site && site.slug ) {
		page( route.getStatsDefaultSitePage( site.slug ) );
	} else {
		page( '/stats' );
	}
};

GlobalShortcuts.prototype.goToBlogPosts = function() {
	const site = this.selectedSite;

	if ( site && site.capabilities && ! site.capabilities.edit_posts ) {
		return null;
	} else if ( site && site.slug ) {
		page( '/posts/my/' + site.slug );
	} else {
		page( '/posts/my' );
	}
};

GlobalShortcuts.prototype.goToPages = function() {
	const site = this.selectedSite;

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
