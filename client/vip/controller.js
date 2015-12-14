/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	qs = require( 'querystring' );

/**
 * Internal Dependencies
 */
var route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	titleActions = require( 'lib/screen-title/actions' ),
	sites = require( 'lib/sites-list' )();

module.exports = {

	vip: function() {
		page.redirect( '/vip/updates' );
	},

	dashboard: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipdashboard = require( './vip-dashboard' );

		titleActions.setTitle( i18n.translate( 'VIP', { textOnly: true } ), { siteID: siteUrl } );

		ReactDom.render(
			React.createElement( vipdashboard, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	deploys: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipdeploys = require( './vip-deploys' );

		titleActions.setTitle( i18n.translate( 'VIP Deploys', { textOnly: true } ), { siteID: siteUrl } );

		ReactDom.render(
			React.createElement( vipdeploys, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	billing: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipbilling = require( './vip-billing' );

		titleActions.setTitle( i18n.translate( 'VIP Billing', { textOnly: true } ), { siteID: siteUrl } );

		ReactDom.render(
			React.createElement( vipbilling, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	support: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipsupport = require( './vip-support' );

		titleActions.setTitle( i18n.translate( 'VIP Support', { textOnly: true } ), { siteID: siteUrl } );

		ReactDom.render(
			React.createElement( vipsupport, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	backups: function( context ) {
		var siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			vipbackups = require( './vip-backups' );

		titleActions.setTitle( i18n.translate( 'VIP Backups', { textOnly: true } ), { siteID: siteUrl } );

		ReactDom.render(
			React.createElement( vipbackups, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	},

	logs: function( context ) {
		var search = qs.parse( context.querystring ).s,
			siteUrl = route.getSiteFragment( context.path ),
			site = sites.getSelectedSite(),
			status = context.params.status,
			viplogs = require( './vip-logs' );

		titleActions.setTitle( i18n.translate( 'VIP Logs', { textOnly: true } ), { siteID: siteUrl } );

		ReactDom.render(
			React.createElement( viplogs, {
				context: context,
				search: search,
				sites: sites,
				site: site,
				status: status,
				path: context.path
			} ),
			document.getElementById( 'primary' )
		);
	}
};
