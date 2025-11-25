import * as React from 'react';
import { Router } from 'react-router-dom';
import { usePersistedHistory } from '../hooks/use-persisted-history';
import type { Location } from 'history';

type Props = {
	children: React.ReactNode;
	routerHistory?: { entries: Location[]; index: number } | undefined;
	persistenceKey?: string | undefined;
};

/**
 * A router like MemoryRouter, but it persists the history to the server using user preferences.
 */
export const PersistentRouter = ( { children, routerHistory, persistenceKey }: Props ) => {
	const { history, state } = usePersistedHistory( { routerHistory, persistenceKey } );

	return (
		<Router location={ state.location } navigator={ history } navigationType={ state.action }>
			{ children }
		</Router>
	);
};
