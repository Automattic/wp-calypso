import { useEffect, useState } from '@wordpress/element';
import { useSelector } from 'react-redux';
import {
	deliverPicks,
	setPicks,
} from 'calypso/my-sites/plugins/marketplace-ai-experience/picks-store';
import { useStore } from 'calypso/state';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const importAgentProvider = () =>
	import(
		/* webpackChunkName: "plugin-recommendations" */ 'calypso/my-sites/plugins/marketplace-ai-experience/agent-provider'
	);

// Module-scoped so the provider object's identity is stable across re-renders.
let cachedProvider: { toolProvider: object } | null = null;

export default function usePluginRecommendationsProvider( enabled: boolean ) {
	const store = useStore();
	const selectedSite = useSelector( getSelectedSite );

	const [ ready, setReady ] = useState( false );

	// Picks are tied to the agent conversation that produced them, which is
	// scoped to a specific site. The picks store is module-scoped (survives
	// route changes), so a site switch would otherwise leave site A's picks
	// rendering under site B. Clear on every site change.
	useEffect( () => {
		if ( enabled ) {
			setPicks( [] );
		}
	}, [ enabled, selectedSite?.ID ] );

	useEffect( () => {
		if ( ! enabled ) {
			setReady( false );
			return;
		}

		if ( cachedProvider ) {
			registerInlineProvider( cachedProvider );
			setReady( true );
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
	}, [ enabled, store ] );

	return ready;
}

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
