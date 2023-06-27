import { createContext, useContext } from '@wordpress/element';
import type { PlansIntent } from 'calypso/my-sites/plans-features-main/hooks/use-plan-types-with-intent';

interface PlansGridContext {
	intent?: PlansIntent;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider: React.FunctionComponent<
	PlansGridContext & { children: React.ReactNode }
> = ( { intent, children } ) => {
	return <PlansGridContext.Provider value={ { intent } }>{ children }</PlansGridContext.Provider>;
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { PlansIntent };

export default PlansGridContextProvider;
