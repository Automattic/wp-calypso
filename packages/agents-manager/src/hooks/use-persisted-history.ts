import {
	AgentsManagerSelect,
	PerSiteRouterHistory,
	SingleRouterHistory,
} from '@automattic/data-stores';
import { select as storeSelect, useSelect } from '@wordpress/data';
import { useState, useLayoutEffect, useCallback, useMemo } from '@wordpress/element';
import { Action, Location } from 'history';
import { AGENTS_MANAGER_STORE } from '../stores';
import { persistAgentsManagerState } from '../utils/persist-agents-manager-state';

const DEFAULT_INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

/**
 * Get the inactivity timeout in milliseconds.
 * Supports a `?inactivity_timeout` query parameter override for testing (value in ms).
 */
function getInactivityTimeoutMs(): number {
	const param = new URLSearchParams( window.location.search ).get( 'inactivity_timeout' );
	const parsed = param ? Number( param ) : NaN;
	return parsed > 0 ? parsed : DEFAULT_INACTIVITY_TIMEOUT_MS;
}

export interface HistoryEvent {
	action: Action;
	location: Location;
}

type PersistCallback = ( historyData: SingleRouterHistory ) => void;

/**
 * This is a custom implementation of the MemoryHistory class from the history package.
 * It is used to persist the navigation history of the agents manager.
 * It persists the history to the server via a callback provided by the hook.
 */
class MemoryHistory {
	private entries: Location[] = [];
	private index: number = -1;
	private listeners: ( ( event: HistoryEvent ) => void )[] = [];
	private onPersist?: PersistCallback;

	constructor(
		initialEntries: Location[] = [
			{ pathname: '/', search: '', hash: '', key: 'default', state: null },
		],
		initialIndex = 0
	) {
		this.entries = initialEntries;
		this.index = initialIndex;
		this.push = this.push.bind( this );
		this.replace = this.replace.bind( this );
		this.go = this.go.bind( this );
		this.goBack = this.goBack.bind( this );
		this.goForward = this.goForward.bind( this );
		this.listen = this.listen.bind( this );
		this.createLocation = this.createLocation.bind( this );
	}
	get length(): number {
		return this.entries.length;
	}

	get action(): Action {
		if ( this.index === 0 ) {
			return Action.Pop;
		}
		if ( this.index === this.entries.length - 1 ) {
			return Action.Push;
		}
		return Action.Replace;
	}

	get location(): Location {
		return this.entries[ this.index ];
	}

	createHref( to: Location ): string {
		return to.pathname + to.search + to.hash;
	}

	push( path: Location, state?: unknown ) {
		const location = this.createLocation( path.pathname + path.search + path.hash, state );
		this.entries = this.entries.slice( 0, this.index + 1 );
		this.entries.push( location );
		// Limit the number of entries to 50 to avoid the history getting too long.
		if ( this.entries.length > 50 ) {
			this.entries.shift();
			this.entries.shift();
			// Keep the start at root so the back button always works.
			this.entries.unshift( this.createLocation( '/' ) );
		} else {
			this.index++;
		}
		this.notifyListeners( Action.Push );
	}

	replace( path: Location, state?: unknown ) {
		const location = this.createLocation( path.pathname + path.search + path.hash, state );
		this.entries[ this.index ] = location;
		this.notifyListeners( Action.Replace );
	}

	go( n: number ) {
		const newIndex = this.index + n;
		if ( newIndex >= 0 && newIndex < this.entries.length ) {
			this.index = newIndex;
			this.notifyListeners( Action.Pop );
		}
	}

	goBack() {
		this.go( -1 );
	}

	goForward() {
		this.go( 1 );
	}

	listen( listener: ( event: HistoryEvent ) => void ) {
		this.listeners.push( listener );
		return () => {
			this.listeners = this.listeners.filter( ( l ) => l !== listener );
		};
	}

	setOnPersist( callback: PersistCallback ) {
		this.onPersist = callback;
	}

	private createLocation( path: string, state?: unknown ): Location {
		const [ pathname, search = '', hash = '' ] = path.split( /[?#]/ );
		return {
			pathname,
			search: search ? `?${ search }` : '',
			hash: hash ? `#${ hash }` : '',
			state,
			key: crypto.randomUUID(),
		};
	}

	private notifyListeners( action: Action ) {
		const event = { action, location: this.location };
		this.listeners.forEach( ( listener ) => listener( event ) );

		this.onPersist?.( { entries: this.entries, index: this.index } );
	}
}

/**
 * Read the full router history map from the store (synchronous, outside React).
 */
function getFullRouterHistory(): PerSiteRouterHistory | undefined {
	return (
		storeSelect( AGENTS_MANAGER_STORE ) as unknown as AgentsManagerSelect
	 ).getAgentsManagerState().routerHistory;
}

export const usePersistedHistory = ( siteKey: string ) => {
	const { persistedHistory, lastActive } = useSelect(
		( select ) => {
			const store = select( AGENTS_MANAGER_STORE ) as unknown as AgentsManagerSelect;
			return {
				persistedHistory: store.getRouterHistory( siteKey ),
				lastActive: store.getLastActivity( siteKey ),
			};
		},
		[ siteKey ]
	);

	// Skip restoring history if the site has been inactive beyond the timeout.
	const isStale = lastActive ? Date.now() - lastActive > getInactivityTimeoutMs() : false;
	const activeHistory = useMemo( () => {
		if ( isStale ) {
			// eslint-disable-next-line no-console
			console.log( `[AgentsManager] Active chat expired for site key "${ siteKey }"` );
			return;
		}
		return persistedHistory;
	}, [ isStale, persistedHistory, siteKey ] );

	// Build history from persisted data. Recreated when `activeHistory` changes,
	// so `useLocation().state` (e.g., `sessionId`) is correct immediately.
	// Safe to use `activeHistory` as dep directly because the store is only
	// populated once from the server — local navigations don't update it.
	const history = useMemo(
		() => new MemoryHistory( activeHistory?.entries, activeHistory?.index ),
		[ activeHistory ]
	);

	const [ state, setState ] = useState< HistoryEvent >( () => ( {
		action: history.action,
		location: history.location,
	} ) );

	// Create a persist callback that merges with existing per-site histories.
	const persistHistory = useCallback(
		( historyData: SingleRouterHistory ) => {
			const fullMap = getFullRouterHistory() || {};
			persistAgentsManagerState( {
				agents_manager_router_history: { ...fullMap, [ siteKey ]: historyData },
			} );
		},
		[ siteKey ]
	);

	// Sync `state`, persist callback, and listener when `history` instance changes.
	useLayoutEffect( () => {
		history.setOnPersist( persistHistory );
		setState( { action: history.action, location: history.location } );
		return history.listen( setState );
	}, [ history, persistHistory ] );

	return { history, state };
};
