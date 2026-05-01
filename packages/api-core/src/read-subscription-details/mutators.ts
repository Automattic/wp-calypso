import { wpcom } from '../wpcom-fetcher';

const getSubkey = (): string | undefined =>
	(
		window as typeof window & {
			currentUser?: { subscriptionManagementSubkey?: string };
		}
	 ).currentUser?.subscriptionManagementSubkey;

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
