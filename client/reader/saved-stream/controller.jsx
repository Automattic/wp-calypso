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

// Uses the cached teams when there are any. Otherwise it waits for them, so an
// Automattician who opens `/read/saved` directly doesn't get a 404.
function fetchTeams( queryClient ) {
	return queryClient
		.ensureQueryData( readTeamsQuery() )
		.then( ( data ) => data.teams )
		.catch( () => [] );
}

function renderSaved( context, next ) {
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
}

const exported = {
	saved( context, next ) {
		fetchTeams( context.queryClient ).then( ( teams ) =>
			isSavedPostsEnabled( teams ) ? renderSaved( context, next ) : notFound( context, next )
		);
	},
};

export default exported;

export const { saved } = exported;
