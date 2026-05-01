import { wpcom } from '../wpcom-fetcher';
import type { SubscriptionDetailsResponse } from './types';

type FetchSubscriptionDetailsParams = {
	blogId?: string;
	subscriptionId?: string;
};

const buildPath = ( { blogId, subscriptionId }: FetchSubscriptionDetailsParams ): string => {
	if ( blogId ) {
		return `/read/sites/${ blogId }/subscription-details`;
	}
	if ( subscriptionId ) {
		return `/read/subscriptions/${ subscriptionId }`;
	}
	throw new Error( 'fetchSubscriptionDetails: blogId or subscriptionId is required' );
};

const getSubkey = (): string | undefined =>
	(
		window as typeof window & {
			currentUser?: { subscriptionManagementSubkey?: string };
		}
	 ).currentUser?.subscriptionManagementSubkey;

export const fetchSubscriptionDetails = async (
	params: FetchSubscriptionDetailsParams
): Promise< SubscriptionDetailsResponse< string > > => {
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
