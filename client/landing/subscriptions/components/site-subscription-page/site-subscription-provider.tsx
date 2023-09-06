import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	SiteSubscriptionContext,
	SiteSubscriptionContextProps,
} from 'calypso/blocks/reader-site-subscription';
import { Path } from 'calypso/blocks/reader-site-subscription/context';

export const SiteSubscriptionProvider: React.FC< { children: React.ReactNode } > = ( {
	children,
} ) => {
	const reactRouterNavigate = useNavigate();
	const { blogId = '' } = useParams();
	const { data, isLoading, error } = SubscriptionManager.useSiteSubscriptionDetailsQuery( blogId );

	let subscriptionData: Reader.SiteSubscriptionDetails< string > | undefined;
	let subscriptionError: Reader.ErrorResponse | undefined;

	if ( Reader.isSiteSubscriptionDetails( data ) ) {
		subscriptionData = data;
	} else if ( Reader.isErrorResponse( data ) ) {
		subscriptionError = data;
	}

	const navigate = useCallback(
		( path: Path ) => {
			switch ( path ) {
				case Path.ManageAllSubscriptions:
					reactRouterNavigate( `/subscriptions/sites` );
					return;
			}
		},
		[ reactRouterNavigate ]
	);

	const contextValue: SiteSubscriptionContextProps = useMemo(
		() => ( {
			navigate,
			data: subscriptionData,
			isLoading,
			error: error || subscriptionError,
		} ),
		[ error, isLoading, navigate, subscriptionData, subscriptionError ]
	);

	return (
		<SiteSubscriptionContext.Provider value={ contextValue }>
			{ children }
		</SiteSubscriptionContext.Provider>
	);
};
