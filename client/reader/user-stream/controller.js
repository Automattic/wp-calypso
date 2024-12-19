import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

const analyticsPageTitle = 'Reader';

export function userPosts( context, next ) {
	const userId = context.params.user_id;
	const basePath = '/read/users/:user_id';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Posts';
	const mcKey = 'user_posts';
	const streamKey = 'user:' + userId;
	const state = context.store.getState();

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack(
		'calypso_reader_user_posts_loaded',
		{ user_id: userId },
		{ pathnameOverride: getCurrentRoute( state ) }
	);

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-stream"
			key={ 'user-posts-' + userId }
			streamKey={ streamKey }
			userId={ userId }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			placeholder={ null }
		/>
	);
	next();
}

export function userComments( context, next ) {
	const userId = context.params.user_id;
	const basePath = '/read/users/:user_id/comments';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Comments';
	const mcKey = 'user_comments';
	const streamKey = 'user-comments:' + userId;

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_user_comments_loaded', { user_id: userId } );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-stream"
			key={ 'user-comments-' + userId }
			streamKey={ streamKey }
			userId={ userId }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			placeholder={ null }
		/>
	);
	next();
}

export function userLikes( context, next ) {
	const userId = context.params.user_id;
	const basePath = '/read/users/:user_id/likes';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Likes';
	const mcKey = 'user_likes';
	const streamKey = 'user-likes:' + userId;

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_user_likes_loaded', { user_id: userId } );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-stream"
			key={ 'user-likes-' + userId }
			streamKey={ streamKey }
			userId={ userId }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			placeholder={ null }
		/>
	);
	next();
}

export function userReposts( context, next ) {
	const userId = context.params.user_id;
	const basePath = '/read/users/:user_id/reposts';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Reposts';
	const mcKey = 'user_reposts';
	const streamKey = 'user-reposts:' + userId;

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_user_reposts_loaded', { user_id: userId } );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-stream"
			key={ 'user-reposts-' + userId }
			streamKey={ streamKey }
			userId={ userId }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			placeholder={ null }
		/>
	);
	next();
}

export function userLists( context, next ) {
	const userId = context.params.user_id;
	const basePath = '/read/users/:user_id/lists';
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Lists';
	const mcKey = 'user_lists';
	const streamKey = 'user-lists:' + userId;

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_user_lists_loaded', { user_id: userId } );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-stream"
			key={ 'user-lists-' + userId }
			streamKey={ streamKey }
			userId={ userId }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			placeholder={ null }
		/>
	);
	next();
}
