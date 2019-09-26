/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import { sectionify } from 'lib/route';
import { recordTrack } from 'reader/stats';
import { trackPageLoad, trackUpdatesLoaded, trackScrollPage } from 'reader/controller-helper';
import AsyncLoad from 'components/async-load';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
	discover( context, next ) {
		const blogId = config( 'discover_blog_id' );
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Site > ' + blogId;
		const streamKey = `site:${ blogId }`;

		const mcKey = 'discover';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		context.primary = (
			<AsyncLoad
				require="reader/site-stream"
				key={ 'site-' + blogId }
				streamKey={ streamKey }
				siteId={ +blogId }
				title="Discover"
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				suppressSiteNameLink={ true }
				showPrimaryFollowButtonOnCards={ false }
				isDiscoverStream={ true }
				showBack={ false }
				className="is-discover-stream is-site-stream"
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
		next();
	},
};

export default exported;

export const { discover } = exported;
