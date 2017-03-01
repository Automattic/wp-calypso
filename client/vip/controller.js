/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';
import page from 'page';

/**
 * Internal Dependencies
 */
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
const sites = require( 'lib/sites-list' )();

import { renderWithReduxStore } from 'lib/react-helpers';

module.exports = {

	vip: function() {
		page.redirect( '/vip/updates' );
	},

	dashboard: function( context ) {
		var site = sites.getSelectedSite(),
			vipdashboard = require( './vip-dashboard' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
		var site = sites.getSelectedSite(),
			vipdeploys = require( './vip-deploys' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Deploys', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
		var site = sites.getSelectedSite(),
			vipbilling = require( './vip-billing' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Billing', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
		var site = sites.getSelectedSite(),
			vipsupport = require( './vip-support' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Support', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
		var site = sites.getSelectedSite(),
			vipbackups = require( './vip-backups' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Backups', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
			site = sites.getSelectedSite(),
			status = context.params.status,
			viplogs = require( './vip-logs' );

		context.store.dispatch( setTitle( i18n.translate( 'VIP Logs', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

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
