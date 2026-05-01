import { wpcom } from '../wpcom-fetcher';
import type { ReadSubscriptionDetailsResponse } from './types';

type FetchReadSubscriptionDetailsParams = {
	blogId?: string;
	subscriptionId?: string;
};

const buildPath = ( { blogId, subscriptionId }: FetchReadSubscriptionDetailsParams ): string => {
	if ( blogId ) {
		return `/read/sites/${ blogId }/subscription-details`;
	}
	if ( subscriptionId ) {
		return `/read/subscriptions/${ subscriptionId }`;
	}
	throw new Error( 'fetchReadSubscriptionDetails: blogId or subscriptionId is required' );
};

const getSubkey = (): string | undefined =>
	(
		window as typeof window & {
			currentUser?: { subscriptionManagementSubkey?: string };
		}
	 ).currentUser?.subscriptionManagementSubkey;

export const fetchReadSubscriptionDetails = async (
	params: FetchReadSubscriptionDetailsParams
): Promise< ReadSubscriptionDetailsResponse< string > > => {
	const path = buildPath( params );
	const subkey = getSubkey();

	if ( subkey ) {
		const response = await fetch( `https://public-api.wordpress.com/wpcom/v2${ path }`, {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				Authorization: `X-WPSUBKEY ${ encodeURIComponent( subkey ) }`,
				'Content-Type': 'application/json',
			},
		} );
		return response.json();
	}

	return wpcom.req.get( {
		path,
		apiNamespace: 'wpcom/v2',
		apiVersion: '2',
	} );
};
