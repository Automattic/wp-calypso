import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { createContext, useContext, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';

interface SubscriptionContextProps {
	blogId: string;
	navigate: ( path: string ) => void;
	data?: Reader.SiteSubscriptionDetails;
	isLoading: boolean;
	error?: Reader.ErrorResponse | unknown;
}

const SubscriptionContext = createContext< SubscriptionContextProps | undefined >( undefined );

export const useSubscription = () => {
	const context = useContext( SubscriptionContext );
	if ( ! context ) {
		throw new Error( 'useSubscription must be used within a SubscriptionProvider' );
	}
	return context;
};

export const SubscriptionProvider: React.FC< { children: ReactNode } > = ( { children } ) => {
	const navigate = useNavigate();
	const { blogId = '' } = useParams();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionDetailsQuery( blogId );

	let subscriptionData: Reader.SiteSubscriptionDetails | undefined;
	let subscriptionError: Reader.ErrorResponse | undefined;

	if ( Reader.isSiteSubscriptionDetails( data ) ) {
		subscriptionData = data;
	} else if ( Reader.isErrorResponse( data ) ) {
		subscriptionError = data;
	}

	const contextValue: SubscriptionContextProps = {
		blogId,
		navigate,
		data: subscriptionData,
		isLoading,
		error: error || subscriptionError,
	};

	return (
		<SubscriptionContext.Provider value={ contextValue }>{ children }</SubscriptionContext.Provider>
	);
};
