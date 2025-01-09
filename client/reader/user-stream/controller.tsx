import { ReactElement } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import wpcom from 'calypso/lib/wp';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import type { AppState } from 'calypso/types';

interface Context {
	params: {
		user_id: string;
	};
	store: {
		getState: () => AppState;
	};
	primary: ReactElement;
}

const analyticsPageTitle = 'Reader';

const isNumeric = ( value: string ): boolean => /^\d+$/.test( value );

async function resolveUserId( userIdentifier: string ): Promise< string > {
	if ( isNumeric( userIdentifier ) ) {
		return userIdentifier;
	}

	try {
		const userData = await wpcom.req.get( `/users/${ encodeURIComponent( userIdentifier ) }/` );
		return userData.ID.toString();
	} catch ( error ) {
		return userIdentifier; // Fallback to original identifier if lookup fails
	}
}

export function userPosts( context: Context, next: () => void ): void {
	const userIdentifier = context.params.user_id;

	resolveUserId( userIdentifier ).then( ( userId ) => {
		const basePath = '/read/users/:user_id';
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Posts';
		const mcKey = 'user_posts';
		const streamKey = 'user:' + userId;

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

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
	} );
}

export function userLists( context: Context, next: () => void ): void {
	const userIdentifier = context.params.user_id;

	resolveUserId( userIdentifier ).then( ( userId ) => {
		const basePath = '/read/users/:user_id/lists';
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > User > ' + userId + ' > Lists';
		const mcKey = 'user_lists';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = (
			<AsyncLoad
				require="calypso/reader/user-stream"
				key={ 'user-lists-' + userId }
				userId={ userId }
			/>
		);
		next();
	} );
}
