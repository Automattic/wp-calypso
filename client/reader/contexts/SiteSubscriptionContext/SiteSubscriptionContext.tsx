import { Reader } from '@automattic/data-stores';
import { createContext, useContext } from 'react';
import { Path } from './const';
import { SiteSubscription } from './types';

export type SiteSubscriptionContextProps = {
	navigate?: ( path: Path ) => void;
	data?: SiteSubscription;
	isLoading?: boolean;
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
