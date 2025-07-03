import { Context } from '@automattic/calypso-router';
import { ReactElement } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';

interface UserProfileContext extends Context {
	params: {
		user_login?: string;
		user_id?: string;
		view?: string;
	};
	primary: ReactElement;
}

const analyticsPageTitle = 'Reader';

export function userProfile( ctx: Context, next: () => void ): void {
	const context = ctx as UserProfileContext;
	const view = context.params.view || 'posts';
	const userLogin = context.params.user_login;
	const userId = context.params.user_id;
	const basePath = context.pathname;
	const fullAnalyticsPageTitle =
		analyticsPageTitle +
		' > User > ' +
		userLogin +
		// Keep the view sentance cased for backward consistency.
		` > ${ view[ 0 ].toUpperCase() + view.slice( 1 ) }`;
	const mcKey = `user_${ view }`;

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

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
			path={ context.path }
			view={ view }
		/>
	);
	next();
}
