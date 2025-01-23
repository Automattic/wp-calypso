import { Context } from '@automattic/calypso-router';
import { ReactElement } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import { getUserProfileBasePath } from 'calypso/reader/user-profile/user-profile.utils';

interface UserPostsContext extends Context {
	params: {
		user_id: string;
	};
	primary: ReactElement;
}

const analyticsPageTitle = 'Reader';

export function userPosts( ctx: Context, next: () => void ): void {
	const context = ctx as UserPostsContext;
	const userId = context.params.user_id;
	const basePath = getUserProfileBasePath();
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Posts';
	const mcKey = 'user_posts';
	const streamKey = 'user:' + userId;

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-profile"
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

export function userLists( context: Context, next: () => void ): void {
	const userId = context.params.user_id;
	const basePath = getUserProfileBasePath( 'lists' );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Lists';
	const mcKey = 'user_lists';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-profile"
			key={ 'user-lists-' + userId }
			userId={ userId }
		/>
	);

	next();
}
