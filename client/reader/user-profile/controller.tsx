import page, { Context } from '@automattic/calypso-router';
import { ReactElement } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import {
	trackPageLoad,
	trackScrollPage,
	shouldShowBackButton,
} from 'calypso/reader/controller-helper';
import { getUserProfileBasePath } from 'calypso/reader/user-profile/user-profile.utils';

interface UserPostsContext extends Context {
	params: {
		user_login?: string;
		user_id?: string;
	};
	primary: ReactElement;
}

const analyticsPageTitle = 'Reader';

export function userPosts( ctx: Context, next: () => void ): void {
	const context = ctx as UserPostsContext;
	const userLogin = context.params.user_login;
	const userId = context.params.user_id;
	const basePath = getUserProfileBasePath();
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userLogin + ' > Posts';
	const mcKey = 'user_posts';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	function goBack() {
		page.back( context.lastRoute );
	}

	context.primary = (
		<AsyncLoad
			require="calypso/reader/user-profile"
			key={ 'user-posts-' + userLogin }
			userLogin={ userLogin }
			userId={ userId }
			trackScrollPage={ trackScrollPage.bind(
				null,
				basePath,
				fullAnalyticsPageTitle,
				analyticsPageTitle,
				mcKey
			) }
			showBack={ shouldShowBackButton( context ) }
			handleBack={ goBack }
			path={ context.path }
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
			path={ context.path }
		/>
	);

	next();
}
