/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import feedStreamFactory from 'lib/feed-stream-store';
import { recordTrack } from 'reader/stats';
import { ensureStoreLoading, trackPageLoad, trackUpdatesLoaded, trackScrollPage, setPageTitle } from 'reader/controller-helper';

const analyticsPageTitle = 'Reader';

export default {
	listListing( context ) {
		var ListStream = require( 'reader/list-stream' ),
			basePath = '/read/list/:owner/:slug',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list,
			listStore = feedStreamFactory( 'list:' + context.params.user + '-' + context.params.list ),
			mcKey = 'list';

		ensureStoreLoading( listStore, context );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_list_loaded', {
			list_owner: context.params.user,
			list_slug: context.params.list
		} );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( ListStream, {
					key: 'tag-' + context.params.user + '-' + context.params.list,
					postStore: listStore,
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					setPageTitle: setPageTitle,
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					),
					onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey )
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	listManagementSites( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/sites',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Sites',
			mcKey = 'list_sites';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( listManagement, {
					key: 'list-management-sites',
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					tab: 'sites',
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					)
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	listManagementTags( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/tags',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Tags',
			mcKey = 'list_tags';

		setPageTitle( i18n.translate( 'Manage List' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( listManagement, {
					key: 'list-management-tags',
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					tab: 'tags',
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					)
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	listManagementDescriptionEdit( context ) {
		const listManagement = require( 'reader/list-management' ),
			basePath = '/read/list/:owner/:slug/edit',
			fullAnalyticsPageTitle = analyticsPageTitle + ' > Manage List > Description',
			mcKey = 'list_edit';

		setPageTitle( i18n.translate( 'Manage List Description' ) );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( listManagement, {
					key: 'list-management-description-edit',
					owner: encodeURIComponent( context.params.user ),
					slug: encodeURIComponent( context.params.list ),
					tab: 'description-edit'
				} )
			),
			document.getElementById( 'primary' )
		);
	}
};
