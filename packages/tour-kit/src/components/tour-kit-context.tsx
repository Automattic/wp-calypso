import { createContext, useContext } from '@wordpress/element';
import { ReactNode } from 'react';
import type { Config } from '../types';

interface TourKitContext {
	config: Config;
}

const TourKitContext = createContext< TourKitContext >( {} as TourKitContext );

const TourKitContextProvider: React.FunctionComponent<
	TourKitContext & { children: ReactNode }
> = ( { config, children } ) => {
	return <TourKitContext.Provider value={ { config } }>{ children }</TourKitContext.Provider>;
};

export const useTourKitContext = (): TourKitContext => useContext( TourKitContext );

export default TourKitContextProvider;
