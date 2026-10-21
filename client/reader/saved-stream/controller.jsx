import { readTeamsQuery } from '@automattic/api-queries';
import AsyncLoad from 'calypso/components/async-load';
import { notFound } from 'calypso/controller';
import { sectionify } from 'calypso/lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { isSavedPostsEnabled } from 'calypso/reader/lib/teams';

const loadMain = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-saved-stream-main" */ 'calypso/reader/saved-stream/main'
	);

const analyticsPageTitle = 'Reader';

const exported = {
	// Waits for the teams when they aren't cached yet, so an Automattician who
	// opens `/read/saved` directly doesn't get a 404.
	requireSavedPosts( context, next ) {
		return context.queryClient
			.ensureQueryData( readTeamsQuery() )
			.then(
				( { teams } ) => teams,
				() => []
			)
			.then( ( teams ) => ( isSavedPostsEnabled( teams ) ? next() : notFound( context, next ) ) );
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
