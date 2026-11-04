import page from '@automattic/calypso-router';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { isSavedPostsEnabled } from 'calypso/reader/data/saved-posts';

const loadMain = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-saved-stream-main" */ 'calypso/reader/saved-stream/main'
	);

const analyticsPageTitle = 'Reader';

const exported = {
	async requireSavedPosts( context, next ) {
		if ( await isSavedPostsEnabled( context.queryClient ) ) {
			next();
			return;
		}
		page.redirect( '/reader' );
	},

	saved( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Saved';
		const mcKey = 'saved';
		const streamKey = 'saved';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = (
			<AsyncLoad
				require={ loadMain }
				key="saved"
				streamKey={ streamKey }
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					analyticsPageTitle,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				placeholder={ null }
			/>
		);
		next();
	},
};

export default exported;

export const { requireSavedPosts, saved } = exported;
