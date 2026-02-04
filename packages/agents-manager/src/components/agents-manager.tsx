import { AgentsManagerContextProvider } from '../contexts';
import UnifiedAIAgent from './unified-ai-agent';
import type { AgentsManagerSite, CurrentUser } from '@automattic/data-stores';

export interface AgentsManagerProps {
	/** The name of the current section (e.g., 'wp-admin', 'gutenberg'). */
	sectionName: string;
	/** The current user object. */
	currentUser?: CurrentUser;
	/** The selected site object. */
	site?: AgentsManagerSite | null;
	/** The current route path. */
	currentRoute?: string;
	/** Called when the agent is closed. */
	handleClose?: () => void;
}

/**
 * Inner component that renders UnifiedAIAgent.
 * Separated to keep context provider at the top level.
 */
function AgentsManagerInner( {
	currentRoute,
	handleClose,
}: {
	currentRoute?: string;
	handleClose?: () => void;
} ) {
	return <UnifiedAIAgent currentRoute={ currentRoute } handleClose={ handleClose } />;
}

/**
 * Main AgentsManager component.
 *
 * Wraps children with AgentsManagerContextProvider to make user, site,
 * and section data available throughout the component tree.
 */
export default function AgentsManager( {
	sectionName,
	currentUser,
	site,
	currentRoute,
	handleClose,
}: AgentsManagerProps ) {
	return (
		<AgentsManagerContextProvider value={ { sectionName, currentUser, site } }>
			<AgentsManagerInner currentRoute={ currentRoute } handleClose={ handleClose } />
		</AgentsManagerContextProvider>
	);
}
