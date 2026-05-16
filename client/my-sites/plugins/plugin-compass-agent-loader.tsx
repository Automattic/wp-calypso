// Mounts the agents-manager dock on plugins pages and bridges the
// Plugin Compass tool provider into AM's externally-loaded providers
// chain. Lives at layout level (rendered by `client/layout/index.jsx`)
// so the dock survives navigation between marketplace sub-routes.

import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import { useEffect, useState } from '@wordpress/element';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import {
	deliverPicks,
	setPicks,
} from 'calypso/my-sites/plugins/marketplace-ai-experience/picks-store';
import { useStore } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

const PLUGIN_COMPASS_AGENT_ID = 'wpcom-workflow-plugin_compass';

const importAgentsManager = () =>
	import(
		/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
	);

const importAgentProvider = () =>
	import(
		/* webpackChunkName: "plugin-compass" */ 'calypso/my-sites/plugins/marketplace-ai-experience/agent-provider'
	);

// Module-scoped so the provider object's identity is stable across re-renders.
let cachedProvider: { toolProvider: object } | null = null;

function registerInlineProvider( provider: object ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	type AMData = { agentProviders?: ( string | object )[] };
	const w = window as unknown as { agentsManagerData?: AMData };
	w.agentsManagerData = w.agentsManagerData || {};

	const existing = w.agentsManagerData.agentProviders;
	const providers = Array.isArray( existing ) ? existing : [];
	if ( ! providers.includes( provider ) ) {
		w.agentsManagerData.agentProviders = [ ...providers, provider ];
	}
}

export default function PluginCompassAgentLoader( {
	sectionName,
}: {
	sectionName: string;
} ): JSX.Element | null {
	if ( sectionName !== 'plugins' || ! isEnabled( 'plugins/plugin-compass' ) ) {
		// Fast-path for the majority of routes pageviews that aren't in the plugins section.
		return null;
	}

	return <PluginCompassAgentLoaderInner />;
}

function PluginCompassAgentLoaderInner(): JSX.Element | null {
	const store = useStore();
	const user = useSelector( getCurrentUser );
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const canInstallPlugins = useSelector( ( state ) =>
		selectedSiteId ? siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_INSTALL_PLUGINS ) : false
	);

	const gatesPassed = !! selectedSite && canInstallPlugins;

	const [ ready, setReady ] = useState( cachedProvider !== null );

	// Picks are tied to the agent conversation that produced them, which is
	// scoped to a specific site. The picks store is module-scoped (survives
	// route changes), so a site switch would otherwise leave site A's picks
	// rendering under site B. Clear on every site change.
	useEffect( () => {
		setPicks( [] );
	}, [ selectedSiteId ] );

	useEffect( () => {
		if ( ! gatesPassed ) {
			return;
		}

		if ( cachedProvider ) {
			registerInlineProvider( cachedProvider );
			return;
		}

		let cancelled = false;
		importAgentProvider().then( ( mod ) => {
			if ( cancelled ) {
				return;
			}

			cachedProvider = {
				toolProvider: mod.createToolProvider( {
					onPicks: ( picks ) => deliverPicks( picks, getSelectedSiteSlug( store.getState() ) ),
				} ),
			};

			registerInlineProvider( cachedProvider );
			setReady( true );
		} );

		return () => {
			cancelled = true;
		};
	}, [ gatesPassed, store ] );

	if ( ! gatesPassed || ! ready || ! selectedSite ) {
		return null;
	}

	return (
		<AsyncLoad
			require={ importAgentsManager }
			placeholder={ null }
			agentId={ PLUGIN_COMPASS_AGENT_ID }
			currentUser={ user }
			sectionName="plugins"
			site={ selectedSite }
			currentSiteId={ selectedSite.ID }
		/>
	);
}
