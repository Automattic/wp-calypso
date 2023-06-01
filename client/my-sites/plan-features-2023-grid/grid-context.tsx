import { createContext, useContext } from '@wordpress/element';
import type { Intent } from 'calypso/my-sites/plans-features-main/hooks/use-plan-types-with-intent';

interface PlansGridContext {
	intent: Intent;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider: React.FunctionComponent< PlansGridContext > = ( {
	intent,
	children,
} ) => {
	return <PlansGridContext.Provider value={ { intent } }>{ children }</PlansGridContext.Provider>;
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { Intent };

export default PlansGridContextProvider;
