import { useState, useLayoutEffect, useCallback, useMemo } from '@wordpress/element';
import { Action, Location } from 'history';
import { generateUUID } from '../utils/generate-uuid';

// Navigation history persists to `sessionStorage`, keyed per site, so each
// tab restores its own routes across page loads.
const STORAGE_KEY = 'agents-manager-router-history';

interface StoredHistory {
	entries: Location[];
	index: number;
}

function readStoredHistory( siteKey: string ): StoredHistory | undefined {
	try {
		const map = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '{}' );
		const history = map[ siteKey ];

		// Corrupted storage must fall back to a fresh history — a malformed
		// shape here would crash the router.
		const isValidHistory =
			Array.isArray( history?.entries ) &&
			history.entries.every(
				( entry: Location | undefined ) => typeof entry?.pathname === 'string'
			) &&
			Number.isInteger( history.index ) &&
			history.index >= 0 &&
			history.index < history.entries.length;
		return isValidHistory ? history : undefined;
	} catch {
		return undefined;
	}
}

function writeStoredHistory( siteKey: string, history: StoredHistory ): void {
	try {
		const map = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '{}' );
		map[ siteKey ] = history;
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( map ) );
	} catch {
		// ignore
	}
}

export interface HistoryEvent {
	action: Action;
	location: Location;
}

type PersistCallback = ( historyData: StoredHistory ) => void;

/**
 * A custom implementation of the `history` package's `MemoryHistory` that
 * reports every navigation through a persist callback provided by the hook.
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
		this.back = this.back.bind( this );
		this.forward = this.forward.bind( this );
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
		// Cap the history at 50 entries.
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

	back() {
		this.go( -1 );
	}

	forward() {
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
			key: generateUUID(),
		};
	}

	private notifyListeners( action: Action ) {
		const event = { action, location: this.location };
		this.listeners.forEach( ( listener ) => listener( event ) );

		this.onPersist?.( { entries: this.entries, index: this.index } );
	}
}

export const usePersistedHistory = ( siteKey: string ) => {
	// Read once and key on `siteKey`: every site switch gets a fresh instance —
	// even between sites with nothing stored — while later navigations persist
	// to storage without recreating it.
	const history = useMemo( () => {
		const persisted = readStoredHistory( siteKey );
		return new MemoryHistory( persisted?.entries, persisted?.index );
	}, [ siteKey ] );

	const [ state, setState ] = useState< HistoryEvent >( () => ( {
		action: history.action,
		location: history.location,
	} ) );

	const persistHistory = useCallback(
		( historyData: StoredHistory ) => writeStoredHistory( siteKey, historyData ),
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
