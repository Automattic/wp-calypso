/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import some from 'lodash/some';
import includes from 'lodash/includes';
import capitalize from 'lodash/capitalize';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import route from 'lib/route';
import notices from 'notices';
import sitesFactory from 'lib/sites-list';
import analytics from 'lib/analytics';
import PlanSetup from './jetpack-plugins-setup';
import PluginListComponent from './main';
import PluginComponent from './plugin';
import PluginBrowser from './plugins-browser';
import titleActions from 'lib/screen-title/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import { setSection } from 'state/ui/actions';

/**
 * Module variables
 */
const allowedCategoryNames = [ 'new', 'popular', 'featured' ];
const sites = sitesFactory();

let lastPluginsListVisited,
	lastPluginsQuerystring;

function renderSinglePlugin( context, siteUrl ) {
	const pluginSlug = decodeURIComponent( context.params.plugin );
	const site = sites.getSelectedSite();
	const analyticsPageTitle = 'Plugins';

	let baseAnalyticsPath = 'plugins/:plugin';

	if ( site ) {
		baseAnalyticsPath += '/:site';
	}

	analytics
	.pageView
	.record( baseAnalyticsPath, `${ analyticsPageTitle } > Plugin Details` );

	// Scroll to the top
	window.scrollTo( 0, 0 );

	// Render single plugin component
	renderWithReduxStore(
		React.createElement( PluginComponent, {
			path: context.path,
			prevPath: lastPluginsListVisited || context.prevPath,
			prevQuerystring: lastPluginsQuerystring,
			sites,
			pluginSlug,
			siteUrl,
			onPluginRefresh: title => titleActions.setTitle( title )
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function getPathWithoutSiteSlug( context, site ) {
	let path = context.pathname;
	if ( site && site.slug ) {
		path = path.replace( '/' + site.slug, '' );
	}
	return path;
}

function renderPluginList( context, basePath, siteUrl ) {
	const search = context.query.s;
	const site = sites.getSelectedSite();

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;
	titleActions.setTitle( i18n.translate( 'Plugins', { textOnly: true } ), { siteID: siteUrl } );

	renderWithReduxStore(
		React.createElement( PluginListComponent, {
			path: basePath,
			context,
			filter: context.params.pluginFilter,
			sites,
			search
		} ),
		document.getElementById( 'primary' ),
		context.store
	);

	if ( search ) {
		analytics.ga.recordEvent( 'Plugins', 'Search', 'Search term', search );
	}

	const analyticsPageTitle = 'Plugins' +
		( context.params.pluginFilter
			? ' ' + capitalize( context.params.pluginFilter )
			: ''
		);

	analytics
	.pageView
	.record( context.pathname.replace( site.domain, ':site' ), analyticsPageTitle );
}

function renderPluginsBrowser( context, siteUrl ) {
	const searchTerm = context.query.s;
	let site = sites.getSelectedSite();
	let { category } = context.params;

	lastPluginsListVisited = getPathWithoutSiteSlug( context, site );
	lastPluginsQuerystring = context.querystring;

	if (
		context.params.siteOrCategory &&
		allowedCategoryNames.indexOf( context.params.siteOrCategory ) >= 0
	) {
		category = context.params.siteOrCategory;
	}
	if ( ! site && allowedCategoryNames.indexOf( context.params.siteOrCategory ) < 0 ) {
		site = { slug: context.params.siteOrCategory };
	}

	titleActions.setTitle( i18n.translate( 'Plugin Browser', { textOnly: true } ), { siteID: siteUrl } );

	const analyticsPageTitle = 'Plugin Browser' + ( category ? ': ' + category : '' );
	analytics
	.pageView
	.record( context.pathname.replace( site.domain, ':site' ), analyticsPageTitle );

	ReactDom.render(
		React.createElement( PluginBrowser, {
			site: site ? site.slug : null,
			path: context.path,
			category,
			sites,
			search: searchTerm
		} ),
		document.getElementById( 'primary' )
	);
}

function renderProvisionPlugins( context ) {
	const section = context.store.getState().ui.section;
	const site = sites.getSelectedSite();
	context.store.dispatch( setSection( Object.assign( {}, section, { secondary: false } ) ) );
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

	analytics.pageView.record( context.pathname.replace( site.domain, ':site' ), 'Jetpack Plugins Setup' );

	renderWithReduxStore(
		React.createElement( PlanSetup, {} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

const controller = {
	validateFilters( filter, context, next ) {
		const wpcomFilter = 'standard';
		const siteUrl = route.getSiteFragment( context.path );
		const site = sites.getSelectedSite();
		const appliedFilter = ( filter ? filter : context.params.plugin ).toLowerCase();

		// bail if /plugins/:site_id?
		if ( siteUrl && appliedFilter === siteUrl.toString().toLowerCase() ) {
			next();
			return;
		}

		// When site URL is present, bail if ...
		//
		// ... the plugin parameter is not on the WordPress.com list for a WordPress.com site.
		const pluginIsNotInList = ! site.jetpack && ! includes( [ 'all', wpcomFilter ], appliedFilter );

		// ... or the plugin parameter is on the WordPress.com list for a Jetpack site.
		// if no site URL is provided, bail if a WordPress.com filter was provided.
		//  Only Jetpack plugins should work when no URL is provided.
		const onlyJetPack = site.jetpack && appliedFilter === wpcomFilter;

		if ( siteUrl && ( pluginIsNotInList || onlyJetPack ) ) {
			page.redirect( '/plugins/' + siteUrl );
			return;
		} else if ( ! siteUrl && appliedFilter === wpcomFilter ) {
			page.redirect( '/plugins' );
			return;
		}

		next();
	},

	plugins( filter, context, next ) {
		const siteUrl = route.getSiteFragment( context.path );
		const basePath = route.sectionify( context.path ).replace( '/' + filter, '' );

		// bail if no site is selected and the user has no Jetpack sites.
		if ( ! siteUrl && sites.getJetpack().length === 0 ) {
			return next();
		}

		context.params.pluginFilter = filter;
		notices.clearNotices( 'notices' );
		renderPluginList( context, basePath, siteUrl );
	},

	plugin( context ) {
		const siteUrl = route.getSiteFragment( context.path );

		if (
			siteUrl &&
			context.params.plugin &&
			context.params.plugin === siteUrl.toString()
		) {
			controller.plugins( 'all', context );
			return;
		}

		notices.clearNotices( 'notices' );
		renderSinglePlugin( context, siteUrl );
	},

	browsePlugins( context ) {
		const siteUrl = route.getSiteFragment( context.path );
		renderPluginsBrowser( context, siteUrl );
	},

	jetpackCanUpdate( filter, context, next ) {
		const selectedSites = sites.getSelectedOrAllWithPlugins();
		let redirectToPlugins = false;

		if ( 'updates' === filter && selectedSites.length ) {
			redirectToPlugins = ! some( sites.getSelectedOrAllWithPlugins(), function( site ) {
				return site && site.jetpack && site.canUpdateFiles;
			} );

			if ( redirectToPlugins ) {
				if ( context.params && context.params.site_id ) {
					page.redirect( `/plugins/${ context.params.site_id }` );
					return;
				}
				page.redirect( '/plugins' );
				return;
			}
		}
		next();
	},

	setupPlugins( context ) {
		renderProvisionPlugins( context );
	}
};

module.exports = controller;
