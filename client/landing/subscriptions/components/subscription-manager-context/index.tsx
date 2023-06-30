import { createContext, useContext } from 'react';

export enum SubscriptionsPortal {
	Subscriptions = 'subscriptions',
	Reader = 'reader',
}

export interface SubscriptionManagerContext {
	portal: SubscriptionsPortal;
	isSubscriptionsPortal?: boolean;
	isReaderPortal?: boolean;
}

const SubscriptionManagerContext = createContext< SubscriptionManagerContext | undefined >(
	undefined
);

export const SubscriptionManagerContextProvider: React.FC< {
	portal: SubscriptionsPortal;
	children?: React.ReactNode;
} > = ( { portal, ...props } ) => {
	return (
		<SubscriptionManagerContext.Provider
			value={ {
				portal,
				isSubscriptionsPortal: portal === SubscriptionsPortal.Subscriptions,
				isReaderPortal: portal === SubscriptionsPortal.Reader,
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
