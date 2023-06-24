import { createContext, useContext } from '@wordpress/element';

export const SubscriptionsPortal = 'subscriptions';
export const ReaderPortal = 'reader';
export type Portal = typeof SubscriptionsPortal | typeof ReaderPortal;

export interface SubscriptionManagerContext {
	portal: Portal;
	isSubscriptionsPortal: boolean;
	isReaderPortal: boolean;
}

const SubscriptionManagerContext = createContext< SubscriptionManagerContext >(
	{} as SubscriptionManagerContext
);

export const SubscriptionManagerContextProvider: React.FunctionComponent<
	SubscriptionManagerContext
> = ( { children, ...context } ) => {
	const helpers = {
		isSubscriptionsPortal: context.portal === SubscriptionsPortal,
		isReaderPortal: context.portal === ReaderPortal,
	};

	return (
		<SubscriptionManagerContext.Provider value={ { ...context, ...helpers } }>
			{ children }
		</SubscriptionManagerContext.Provider>
	);
};

export const useSubscriptionManagerContext = (): SubscriptionManagerContext =>
	useContext( SubscriptionManagerContext );
