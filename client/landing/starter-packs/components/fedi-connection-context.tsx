import { createContext, useContext } from 'react';
import useFediConnection from '../hooks/use-fedi-connection';
import type { FediConnectionState, FediConnectionActions } from '../hooks/use-fedi-connection';

type ContextValue = [ FediConnectionState, FediConnectionActions ];

const FediConnectionContext = createContext< ContextValue | null >( null );

export function FediConnectionProvider( { children }: { children: React.ReactNode } ) {
	const value = useFediConnection();
	return (
		<FediConnectionContext.Provider value={ value }>{ children }</FediConnectionContext.Provider>
	);
}

export function useFediConnectionContext(): ContextValue {
	const ctx = useContext( FediConnectionContext );
	if ( ! ctx ) {
		throw new Error( 'useFediConnectionContext must be used within a FediConnectionProvider' );
	}
	return ctx;
}
