import { createContext, useContext } from '@wordpress/element';

export const SubscriptionsPortal = 'subscriptions';
export const ReaderPortal = 'reader';
export type Portal = typeof SubscriptionsPortal | typeof ReaderPortal;

export interface SubscriptionManagerContext {
	portal: Portal;
}

const SubscriptionManagerContext = createContext< SubscriptionManagerContext >(
	{} as SubscriptionManagerContext
);

export const SubscriptionManagerContextProvider: React.FunctionComponent<
	SubscriptionManagerContext
> = ( { children, ...config } ) => {
	return (
		<SubscriptionManagerContext.Provider value={ config }>
			{ children }
		</SubscriptionManagerContext.Provider>
	);
};

export const useSubscriptionManagerContext = (): SubscriptionManagerContext =>
	useContext( SubscriptionManagerContext );
