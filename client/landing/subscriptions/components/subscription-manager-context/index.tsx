import { createContext, useContext } from 'react';

export enum SiteSubscriptionsPortal {
	Subscriptions = 'subscriptions',
	Reader = 'reader',
}

export interface SubscriptionManagerContext {
	portal: SiteSubscriptionsPortal;
	isSubscriptionsPortal?: boolean;
	isReaderPortal?: boolean;
}

const SubscriptionManagerContext = createContext< SubscriptionManagerContext | undefined >(
	undefined
);

export const SubscriptionManagerContextProvider: React.FC< {
	portal: SiteSubscriptionsPortal;
	children?: React.ReactNode;
} > = ( { portal, ...props } ) => {
	return (
		<SubscriptionManagerContext.Provider
			value={ {
				portal,
				isSubscriptionsPortal: portal === SiteSubscriptionsPortal.Subscriptions,
				isReaderPortal: portal === SiteSubscriptionsPortal.Reader,
			} }
			{ ...props }
		/>
	);
};

export const useSubscriptionManagerContext = (): SubscriptionManagerContext => {
	const context = useContext( SubscriptionManagerContext );
	if ( ! context ) {
		throw new Error(
			'useSubscriptionManagerContext must be used within a SubscriptionManagerContextProvider'
		);
	}
	return context;
};
