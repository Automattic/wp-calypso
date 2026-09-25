import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelector } from 'react-redux';
import {
	deliverPicks,
	setPicks,
} from 'calypso/my-sites/plugins/marketplace-ai-experience/picks-store';
import { useStore } from 'calypso/state';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

type InlineProvider = { toolProvider: object };
type Store = ReturnType< typeof useStore >;

const providerLoaders = new Map< string, ( store: Store ) => Promise< InlineProvider > >( [
	[
		'plugins',
		async ( store ) => {
			const { createToolProvider } = await import(
				/* webpackChunkName: "plugin-recommendations" */ 'calypso/my-sites/plugins/marketplace-ai-experience/agent-provider'
			);
			return {
				toolProvider: createToolProvider( {
					onPicks: ( picks ) => deliverPicks( picks, getSelectedSiteSlug( store.getState() ) ),
				} ),
			};
		},
	],
] );

export function getSectionAgentProviderKey( sectionName: string ) {
	return providerLoaders.has( sectionName ) ? sectionName : 'default';
}

export default function useSectionAgentProvider( sectionName: string, enabled: boolean ) {
	const store = useStore();
	const selectedSite = useSelector( getSelectedSite );
	const loadProvider = providerLoaders.get( sectionName );
	const cachedProviders = useRef( new Map< string, InlineProvider >() );
	const [ readySection, setReadySection ] = useState< string | null >( null );

	// Picks are tied to the agent conversation that produced them, which is
	// scoped to a specific site. The picks store is module-scoped (survives
	// route changes), so a site switch would otherwise leave site A's picks
	// rendering under site B. Clear on every site change.
	useEffect( () => {
		if ( enabled && sectionName === 'plugins' ) {
			setPicks( [] );
		}
	}, [ enabled, sectionName, selectedSite?.ID ] );

	useEffect( () => {
		setReadySection( null );
		if ( ! enabled || ! loadProvider ) {
			return;
		}

		let cancelled = false;
		let unregister: ( () => void ) | undefined;
		const register = ( provider: InlineProvider ) => {
			if ( cancelled ) {
				return;
			}
			cachedProviders.current.set( sectionName, provider );
			unregister = registerInlineProvider( provider );
			setReadySection( sectionName );
		};

		const cachedProvider = cachedProviders.current.get( sectionName );
		if ( cachedProvider ) {
			register( cachedProvider );
		} else {
			loadProvider( store ).then( register );
		}

		return () => {
			cancelled = true;
			unregister?.();
		};
	}, [ enabled, loadProvider, sectionName, store ] );

	return ! loadProvider || ( enabled && readySection === sectionName );
}

function registerInlineProvider( provider: object ) {
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

	return () => {
		const current = w.agentsManagerData?.agentProviders;
		if ( Array.isArray( current ) ) {
			w.agentsManagerData!.agentProviders = current.filter( ( entry ) => entry !== provider );
		}
	};
}
