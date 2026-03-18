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
	const { history, state } = usePersistedHistory( siteKey );

	return (
		<Router location={ state.location } navigator={ history } navigationType={ state.action }>
			{ children }
		</Router>
	);
};
