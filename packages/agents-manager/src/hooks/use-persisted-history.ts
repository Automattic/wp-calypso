import { AgentsManagerSelect } from '@automattic/data-stores';
import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useLayoutEffect } from '@wordpress/element';
import { Action, Location } from 'history';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { AGENTS_MANAGER_STORE } from '../stores';

export interface HistoryEvent {
	action: Action;
	location: Location;
}

/**
 * This is a custom implementation of the MemoryHistory class from the history package.
 * It is used to persist the navigation history of the agents manager.
 * It persists the history to the server using user preferences.
 */
class MemoryHistory {
	private entries: Location[] = [];
	private index: number = -1;
	private listeners: ( ( event: HistoryEvent ) => void )[] = [];

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

		if ( canAccessWpcomApis() ) {
			wpcomRequest( {
				path: '/agents-manager/state',
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: {
					state: {
						agents_manager_router_history: { entries: this.entries, index: this.index },
					},
				},
			} ).catch( () => {} );
		} else {
			apiFetch( {
				global: true,
				path: '/agents-manager/open-state',
				method: 'PUT',
				data: {
					agents_manager_router_history: { entries: this.entries, index: this.index },
				},
			} as Parameters< typeof apiFetch >[ 0 ] ).catch( () => {} );
		}
	}
}

export const usePersistedHistory = () => {
	const [ history, setHistory ] = useState< MemoryHistory >( new MemoryHistory() );
	const [ state, setState ] = useState< HistoryEvent >( {
		action: history.action,
		location: history.location,
	} );
	const persistedHistory = useSelect(
		( select ) => ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getRouterHistory(),
		[]
	);

	useLayoutEffect( () => {
		return history.listen( setState );
	}, [ history ] );

	useEffect( () => {
		if ( persistedHistory ) {
			const history = new MemoryHistory( persistedHistory.entries, persistedHistory.index );
			setHistory( history );

			setState( {
				action: history.action,
				location: history.location,
			} );
		}
	}, [ persistedHistory ] );

	return { history, state };
};
