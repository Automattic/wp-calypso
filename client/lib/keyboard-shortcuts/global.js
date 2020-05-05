/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { getStatsDefaultSitePage } from 'lib/route';
import KeyboardShortcuts from 'lib/keyboard-shortcuts';
import { reduxDispatch, reduxGetState } from 'lib/redux-bridge';
import { getSectionGroup } from 'state/ui/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

let singleton;

export default function () {
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

GlobalShortcuts.prototype.bindShortcuts = function () {
	KeyboardShortcuts.on( 'open-help', this.openHelp.bind( this ) );
	KeyboardShortcuts.on( 'go-to-reader', this.goToReader.bind( this ) );
	KeyboardShortcuts.on( 'go-to-my-likes', this.goToMyLikes.bind( this ) );
	KeyboardShortcuts.on( 'open-site-selector', this.openSiteSelector.bind( this ) );
	KeyboardShortcuts.on( 'go-to-stats', this.goToStats.bind( this ) );
	KeyboardShortcuts.on( 'go-to-blog-posts', this.goToBlogPosts.bind( this ) );
	KeyboardShortcuts.on( 'go-to-pages', this.goToPages.bind( this ) );

	if ( config.isEnabled( 'devdocs' ) ) {
		KeyboardShortcuts.on( 'go-to-dev-docs', this.goToDevDocs.bind( this ) );
	}
};

GlobalShortcuts.prototype.setSelectedSite = function ( site ) {
	this.selectedSite = site;
};

GlobalShortcuts.prototype.openHelp = function () {
	// the inline help component is responsible for injecting this
	if ( this.showInlineHelp ) {
		this.showInlineHelp();
	}
};

GlobalShortcuts.prototype.openSiteSelector = function () {
	if ( 'sites' === getSectionGroup( reduxGetState() ) ) {
		reduxDispatch( setLayoutFocus( 'sites' ) );
	} else {
		page( '/sites' );
	}
};

GlobalShortcuts.prototype.goToReader = function () {
	page.redirect( '/read' );
};

GlobalShortcuts.prototype.goToMyLikes = function () {
	page( '/activities/likes' );
};

GlobalShortcuts.prototype.goToStats = function () {
	const site = this.selectedSite;

	if ( site && site.capabilities && ! site.capabilities.view_stats ) {
		return null;
	} else if ( site && site.slug ) {
		page( getStatsDefaultSitePage( site.slug ) );
	} else {
		page( '/stats' );
	}
};

GlobalShortcuts.prototype.goToBlogPosts = function () {
	const site = this.selectedSite;

	if ( site && site.capabilities && ! site.capabilities.edit_posts ) {
		return null;
	} else if ( site && site.slug ) {
		page( '/posts/my/' + site.slug );
	} else {
		page( '/posts/my' );
	}
};

GlobalShortcuts.prototype.goToPages = function () {
	const site = this.selectedSite;

	if ( site && site.capabilities && ! site.capabilities.edit_pages ) {
		return null;
	} else if ( site && site.slug ) {
		page( '/pages/' + site.slug );
	} else {
		page( '/pages' );
	}
};

GlobalShortcuts.prototype.goToDevDocs = function () {
	page( '/devdocs' );
};
