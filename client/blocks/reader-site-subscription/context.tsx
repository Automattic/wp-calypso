import { Reader } from '@automattic/data-stores';
import { createContext, useContext } from 'react';

export type SiteSubscriptionContextProps = {
	blogId?: string;
	subscriptionId?: number;
	navigate: ( path: string ) => void;
	data?: Reader.SiteSubscriptionDetails< string >;
	isLoading: boolean;
	error?: Reader.ErrorResponse | unknown;
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
