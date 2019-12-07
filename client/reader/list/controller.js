/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { recordTrack } from 'reader/stats';
import { trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';

const analyticsPageTitle = 'Reader';

const exported = {
	listListing( context, next ) {
		const basePath = '/read/list/:owner/:slug';
		const fullAnalyticsPageTitle =
			analyticsPageTitle + ' > List > ' + context.params.user + ' - ' + context.params.list;
		const mcKey = 'list';
		const streamKey =
			'list:' + JSON.stringify( { owner: context.params.user, slug: context.params.list } );

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_list_loaded', {
			list_owner: context.params.user,
			list_slug: context.params.list,
		} );

		context.primary = (
			<AsyncLoad
				require="reader/list-stream"
				key={ 'tag-' + context.params.user + '-' + context.params.list }
				streamKey={ streamKey }
				owner={ encodeURIComponent( context.params.user ) }
				slug={ encodeURIComponent( context.params.list ) }
				showPrimaryFollowButtonOnCards={ false }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
			/>
		);
		next();
	},
};

export default exported;

export const { listListing } = exported;
