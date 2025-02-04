import { Reader } from '@automattic/data-stores';
import { useSiteSubscriptionDetailsQuery } from '@automattic/data-stores/src/reader/queries';
import { ReactNode, useMemo } from 'react';
import { SiteSubscriptionContext } from 'calypso/blocks/reader-site-subscription';
import { Path } from 'calypso/blocks/reader-site-subscription/context';
import { navigate as calypsoNavigate } from 'calypso/lib/navigate';

const navigate = ( path: Path ) => {
	switch ( path ) {
		case Path.ManageAllSubscriptions:
			calypsoNavigate( '/reader/subscriptions/' );
			return;
	}
};

type SiteSubscriptionProviderProps = {
	children: ReactNode;
	blogId?: string;
	subscriptionId?: string;
};

const SiteSubscriptionProvider: React.FC< SiteSubscriptionProviderProps > = ( {
	children,
	blogId,
	subscriptionId,
} ) => {
	const { data, isLoading, error } = useSiteSubscriptionDetailsQuery( blogId, subscriptionId );

	let subscriptionData: Reader.SiteSubscriptionDetails< string > | undefined;
	let subscriptionError: Reader.ErrorResponse | undefined;

	if ( Reader.isSiteSubscriptionDetails( data ) ) {
		subscriptionData = data;
	} else if ( Reader.isErrorResponse( data ) ) {
		subscriptionError = data;
	}

	const contextValue = useMemo(
		() => ( {
			navigate,
			data: subscriptionData,
			isLoading,
			error: error || subscriptionError,
			blogId,
			subscriptionId,
		} ),
		[ blogId, error, isLoading, subscriptionData, subscriptionError, subscriptionId ]
	);

	return (
		<SiteSubscriptionContext.Provider value={ contextValue }>
			{ children }
		</SiteSubscriptionContext.Provider>
	);
};

export default SiteSubscriptionProvider;
