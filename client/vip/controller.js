/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	i18n = require( 'i18n-calypso' ),
	page = require( 'page' );

/**
 * Internal Dependencies
 */
var route = require( 'lib/route' ),
	titleActions = require( 'lib/screen-title/actions' ),
	sites = require( 'lib/sites-list' )();

import { renderWithReduxStore } from 'lib/react-helpers';

module.exports = {

	vip: function() {
		page.redirect( '/vip/updates' );
	},

	dashboard: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipdashboard = require( './vip-dashboard' );

		titleActions.setTitle( i18n.translate( 'VIP', { textOnly: true } ), { siteID: siteUrl } );

		renderWithReduxStore(
			React.createElement( vipdashboard, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	deploys: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipdeploys = require( './vip-deploys' );

		titleActions.setTitle( i18n.translate( 'VIP Deploys', { textOnly: true } ), { siteID: siteUrl } );

		renderWithReduxStore(
			React.createElement( vipdeploys, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	billing: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipbilling = require( './vip-billing' );

		titleActions.setTitle( i18n.translate( 'VIP Billing', { textOnly: true } ), { siteID: siteUrl } );

		renderWithReduxStore(
			React.createElement( vipbilling, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	support: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipsupport = require( './vip-support' );

		titleActions.setTitle( i18n.translate( 'VIP Support', { textOnly: true } ), { siteID: siteUrl } );

		renderWithReduxStore(
			React.createElement( vipsupport, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	backups: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipbackups = require( './vip-backups' );

		titleActions.setTitle( i18n.translate( 'VIP Backups', { textOnly: true } ), { siteID: siteUrl } );

		renderWithReduxStore(
			React.createElement( vipbackups, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	logs: function( context ) {
		var search = context.query.s,
			siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			status = context.params.status,
			viplogs = require( './vip-logs' );

		titleActions.setTitle( i18n.translate( 'VIP Logs', { textOnly: true } ), { siteID: siteUrl } );

		renderWithReduxStore(
			React.createElement( viplogs, {
				context: context,
				search: search,
				sites: sites,
				site: site,
				status: status,
				path: context.path
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
