import { Reader } from '@automattic/data-stores';
import { createContext, useContext } from 'react';

/**
 * Possible paths from the site subscription page. They're relative to this page.
 * Why the SiteSubscriptionContextProps.navigate callback prop and the `Path` enum?
 * - Both the Calypso client and the landing/subscriptions app use the subscription page.
 * - They have different ways to handle routing (pagejs and react-router-dom respectively), so we need different paths.
 */
export const enum Path {
	ManageAllSubscriptions = 'manageAllSubscriptions',
}

export type SiteSubscriptionContextProps = {
	navigate: ( path: Path ) => void;
	data?: Reader.SiteSubscriptionDetails< string >;
	isLoading: boolean;
	error?: Reader.ErrorResponse | unknown;
	blogId?: string;
	subscriptionId?: string;
};

export const SiteSubscriptionContext = createContext< SiteSubscriptionContextProps | undefined >(
	undefined
);

export const useSiteSubscription = () => {
	const context = useContext( SiteSubscriptionContext );
	if ( ! context ) {
		throw new Error( 'useSubscription must be used within a SubscriptionProvider' );
	}
	return context;
};
