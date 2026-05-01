import { wpcom } from '../wpcom-fetcher';

const getSubkey = (): string | undefined =>
	(
		window as typeof window & {
			currentUser?: { subscriptionManagementSubkey?: string };
		}
	 ).currentUser?.subscriptionManagementSubkey;

const isLoggedOut = (): boolean => Boolean( getSubkey() );

type PostReadSubscriptionOptions = {
	path: string;
	apiVersion: '1.1' | '1.2' | '2';
	apiNamespace?: string;
	body?: object;
};

export const postReadSubscription = async < T >( {
	path,
	apiVersion,
	apiNamespace,
	body,
}: PostReadSubscriptionOptions ): Promise< T > => {
	const subkey = getSubkey();

	if ( subkey ) {
		const url =
			apiVersion === '2'
				? `https://public-api.wordpress.com/wpcom/v2${ path }`
				: `https://public-api.wordpress.com/rest/v${ apiVersion }${ path }`;
		const response = await fetch( url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				Authorization: `X-WPSUBKEY ${ encodeURIComponent( subkey ) }`,
				'Content-Type': 'application/json',
			},
			body: body ? JSON.stringify( body ) : undefined,
		} );
		return response.json();
	}

	return wpcom.req.post( {
		path,
		apiVersion,
		apiNamespace,
		body,
	} );
};

export type UnsubscribeFromReadSiteParams = {
	subscriptionId?: number;
	blogId?: number | string;
	url?: string;
	emailId?: string;
};

export type UnsubscribeFromReadSiteResponse = {
	success?: boolean;
	subscribed?: boolean;
	subscription?: null;
};

export const unsubscribeFromReadSite = (
	params: UnsubscribeFromReadSiteParams
): Promise< UnsubscribeFromReadSiteResponse > => {
	const { subscriptionId, blogId, url, emailId } = params;

	if ( isLoggedOut() ) {
		if ( ! blogId ) {
			throw new Error( 'unsubscribeFromReadSite: blogId is required for logged-out users' );
		}
		return postReadSubscription< UnsubscribeFromReadSiteResponse >( {
			path: `/read/site/${ blogId }/post_email_subscriptions/delete`,
			apiVersion: '1.2',
			body: emailId ? { email_id: emailId } : {},
		} );
	}

	if ( ! subscriptionId && ! url ) {
		throw new Error( 'unsubscribeFromReadSite: subscriptionId or url is required' );
	}

	return postReadSubscription< UnsubscribeFromReadSiteResponse >( {
		path: '/read/following/mine/delete',
		apiVersion: '1.1',
		body: {
			source: 'calypso',
			...( subscriptionId ? { sub_id: subscriptionId } : { url } ),
			...( emailId ? { email_id: emailId } : {} ),
			...( blogId ? { blog_id: blogId } : {} ),
		},
	} );
};
