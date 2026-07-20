import { useSyncExternalStore } from 'react';

export type Workspace = 'essential' | 'advanced' | 'commerce';

const WORKSPACES: Workspace[] = [ 'essential', 'advanced', 'commerce' ];

const STORAGE_KEY = 'dashboard-workspace';
const listeners = new Set< () => void >();

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function getWorkspace(): Workspace {
	if ( typeof window === 'undefined' ) {
		return 'essential';
	}
	const stored = window.localStorage.getItem( STORAGE_KEY ) as Workspace | null;
	return stored && WORKSPACES.includes( stored ) ? stored : 'essential';
}

export function setWorkspace( workspace: Workspace ) {
	window.localStorage.setItem( STORAGE_KEY, workspace );
	listeners.forEach( ( listener ) => listener() );
}

export function useWorkspace(): Workspace {
	return useSyncExternalStore( subscribe, getWorkspace, () => 'essential' );
}
