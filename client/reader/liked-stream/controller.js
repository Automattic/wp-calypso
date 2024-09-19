import { createElement } from 'react';
import { sectionify } from 'calypso/lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import LikedPostsStream from 'calypso/reader/liked-stream/main';

const analyticsPageTitle = 'Reader';

const exported = {
	likes( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > My Likes';
		const mcKey = 'postlike';
		const streamKey = 'likes';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = (
			<div>
				{ createElement( LikedPostsStream, {
					key: 'liked',
					streamKey,
					trackScrollPage: trackScrollPage.bind(
						null,
						basePath,
						fullAnalyticsPageTitle,
						analyticsPageTitle,
						mcKey
					),
					onUpdatesShown: trackUpdatesLoaded.bind( null, mcKey ),
				} ) }
			</div>
		);
		next();
	},
};

export default exported;

export const { likes } = exported;
