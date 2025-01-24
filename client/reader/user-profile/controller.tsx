import { Context } from '@automattic/calypso-router';
import { ReactElement } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import { getUserProfileBasePath } from 'calypso/reader/user-profile/user-profile.utils';

interface UserPostsContext extends Context {
	params: {
		user_login: string;
	};
	primary: ReactElement;
}

const analyticsPageTitle = 'Reader';

export function userPosts( ctx: Context, next: () => void ): void {
	const context = ctx as UserPostsContext;
	const userLogin = context.params.user_login;
	const basePath = getUserProfileBasePath();
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userLogin + ' > Posts';
	const mcKey = 'user_posts';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-profile"
			key={ 'user-posts-' + userLogin }
			userLogin={ userLogin }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
		/>
	);
	next();
}

export function userLists( ctx: Context, next: () => void ): void {
	const context = ctx as UserPostsContext;
	const userLogin = context.params.user_login;
	const basePath = getUserProfileBasePath( 'lists' );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userLogin + ' > Lists';
	const mcKey = 'user_lists';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-profile"
			key={ 'user-lists-' + userLogin }
			userLogin={ userLogin }
		/>
	);

	next();
}
