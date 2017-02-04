/**
 * External Dependencies
 */
var React = require( 'react' ),
	i18n = require( 'i18n-calypso' ),
	page = require( 'page' );

/**
 * Internal Dependencies
 */
var setTitle = require( 'state/document-head/actions' ).setDocumentHeadTitle,
	sites = require( 'lib/sites-list' )();

import { renderPage } from 'lib/react-helpers';

module.exports = {

	vip: function() {
		page.redirect( '/vip/updates' );
	},

	dashboard: function( context ) {
		var site = sites.getSelectedSite(),
			vipdashboard = require( './vip-dashboard' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		renderPage(
			React.createElement( vipdashboard, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			context
		);
	},

	deploys: function( context ) {
		var site = sites.getSelectedSite(),
			vipdeploys = require( './vip-deploys' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Deploys', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		renderPage(
			React.createElement( vipdeploys, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			context
		);
	},

	billing: function( context ) {
		var site = sites.getSelectedSite(),
			vipbilling = require( './vip-billing' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Billing', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		renderPage(
			React.createElement( vipbilling, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			context
		);
	},

	support: function( context ) {
		var site = sites.getSelectedSite(),
			vipsupport = require( './vip-support' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Support', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		renderPage(
			React.createElement( vipsupport, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			context
		);
	},

	backups: function( context ) {
		var site = sites.getSelectedSite(),
			vipbackups = require( './vip-backups' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Backups', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		renderPage(
			React.createElement( vipbackups, {
				context: context,
				sites: sites,
				site: site,
				path: context.path
			} ),
			context
		);
	},

	logs: function( context ) {
		var search = context.query.s,
			site = sites.getSelectedSite(),
			status = context.params.status,
			viplogs = require( './vip-logs' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Logs', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		renderPage(
			React.createElement( viplogs, {
				context: context,
				search: search,
				sites: sites,
				site: site,
				status: status,
				path: context.path
			} ),
			context
		);
	}
};
