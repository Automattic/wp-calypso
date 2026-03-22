import { Router } from 'react-router-dom';
import { usePersistedHistory } from '../hooks/use-persisted-history';

interface Props {
	children: React.ReactNode;
	siteKey: string;
}

/**
 * A router like MemoryRouter, but it persists the history to the server using user preferences.
 */
export const PersistentRouter = ( { children, siteKey }: Props ) => {
	const { history, historyState } = usePersistedHistory( siteKey );

	return (
		<Router
			location={ historyState.location }
			navigator={ history }
			navigationType={ historyState.action }
		>
			{ children }
		</Router>
	);
};
