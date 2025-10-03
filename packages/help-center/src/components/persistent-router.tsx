import * as React from 'react';
import { Router } from 'react-router-dom';
import { usePersistedHistory } from '../hooks/use-persisted-history';

type Props = {
	children: React.ReactNode;
};

/**
 * A router like MemoryRouter, but it persists the history to the server using user preferences.
 */
export const PersistentRouter = ( { children }: Props ) => {
	const { history, state } = usePersistedHistory();

	return (
		<Router location={ state.location } navigator={ history } navigationType={ state.action }>
			{ children }
		</Router>
	);
};
