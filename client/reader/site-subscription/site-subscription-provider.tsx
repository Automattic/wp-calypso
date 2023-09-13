import { Reader } from '@automattic/data-stores';
import { ReactNode, useMemo } from 'react';
import { SiteSubscriptionContext } from 'calypso/blocks/reader-site-subscription';
import { Path } from 'calypso/blocks/reader-site-subscription/context';
import { navigate as calypsoNavigate } from 'calypso/lib/navigate';
import useSiteSubscriptionQuery from '../hooks/use-site-subscription-query';

const navigate = ( path: Path ) => {
	switch ( path ) {
		case Path.ManageAllSubscriptions:
			calypsoNavigate( '/read/subscriptions/' );
			return;
	}
};

const SiteSubscriptionProvider: React.FC< { subscriptionId: number; children: ReactNode } > = ( {
	children,
	subscriptionId,
} ) => {
	const { data, isLoading, error } = useSiteSubscriptionQuery( subscriptionId );

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
		} ),
		[ error, isLoading, subscriptionData, subscriptionError ]
	);

	return (
		<SiteSubscriptionContext.Provider value={ contextValue }>
			{ children }
		</SiteSubscriptionContext.Provider>
	);
};

export default SiteSubscriptionProvider;
