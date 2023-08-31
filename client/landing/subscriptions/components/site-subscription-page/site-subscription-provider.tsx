import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useNavigate, useParams } from 'react-router';
import {
	SiteSubscriptionContext,
	SiteSubscriptionContextProps,
} from 'calypso/blocks/reader-site-subscription';

export const SiteSubscriptionProvider: React.FC< { children: React.ReactNode } > = ( {
	children,
} ) => {
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

	const contextValue: SiteSubscriptionContextProps = {
		blogId,
		navigate,
		data: subscriptionData,
		isLoading,
		error: error || subscriptionError,
	};

	return (
		<SiteSubscriptionContext.Provider value={ contextValue }>
			{ children }
		</SiteSubscriptionContext.Provider>
	);
};
