/**
 * Development-only preview state for the dashboard opt-in flow, shared by the
 * new dashboard and the classic A4A app. The state lives in the URL, so every
 * moment of the flow has its own link, and the floating panel moves between
 * the two apps by link. Nothing here reads or saves the agency's preference.
 */
import { useSyncExternalStore } from 'react';

export const isOptInPreviewEnabled = process.env.NODE_ENV === 'development';

export type PreviewRole = 'owner' | 'member';
export type PreviewAgency = 'not-opted-in' | 'opted-in' | 'new';
export type PreviewApp = 'classic' | 'dashboard';
export type PreviewOverlay = 'not-now' | 'menu' | 'switch-back' | 'back' | null;

export interface OptInPreviewState {
	role: PreviewRole;
	agency: PreviewAgency;
	/** First visit: classic shows the invitation, the new dashboard the welcome notice. */
	firstVisit: boolean;
	overlay: PreviewOverlay;
}

export interface OptInStep {
	id: string;
	label: string;
	app: PreviewApp;
	path: string;
	state: Omit< OptInPreviewState, 'role' >;
}

export const OPT_IN_STEPS: OptInStep[] = [
	{
		id: 'invite',
		label: 'Invitation on classic Overview',
		app: 'classic',
		path: '/overview',
		state: { agency: 'not-opted-in', firstVisit: true, overlay: null },
	},
	{
		id: 'not-now',
		label: 'Not now',
		app: 'classic',
		path: '/overview',
		state: { agency: 'not-opted-in', firstVisit: false, overlay: 'not-now' },
	},
	{
		id: 'menu',
		label: 'Profile menu, any time later',
		app: 'classic',
		path: '/overview',
		state: { agency: 'not-opted-in', firstVisit: false, overlay: 'menu' },
	},
	{
		id: 'arrival',
		label: 'First visit to the new dashboard',
		app: 'dashboard',
		path: '/overview',
		state: { agency: 'opted-in', firstVisit: true, overlay: null },
	},
	{
		id: 'forwarded',
		label: 'A classic link forwards',
		app: 'dashboard',
		path: '/purchases',
		state: { agency: 'opted-in', firstVisit: true, overlay: null },
	},
	{
		id: 'amplify',
		label: 'Amplify stays in classic',
		app: 'classic',
		path: '/amplify',
		state: { agency: 'opted-in', firstVisit: false, overlay: null },
	},
	{
		id: 'settings',
		label: 'Agency > Dashboard',
		app: 'dashboard',
		path: '/agency/dashboard',
		state: { agency: 'opted-in', firstVisit: false, overlay: null },
	},
	{
		id: 'switch-back',
		label: 'Switching back',
		app: 'dashboard',
		path: '/agency/dashboard',
		state: { agency: 'opted-in', firstVisit: false, overlay: 'switch-back' },
	},
	{
		id: 'back',
		label: 'Back in classic',
		app: 'classic',
		path: '/overview',
		state: { agency: 'not-opted-in', firstVisit: false, overlay: 'back' },
	},
	{
		id: 'new-agency',
		label: 'A new agency starts here',
		app: 'dashboard',
		path: '/overview',
		state: { agency: 'new', firstVisit: true, overlay: null },
	},
];

const DEFAULT_STATE: OptInPreviewState = {
	role: 'owner',
	agency: 'not-opted-in',
	firstVisit: true,
	overlay: null,
};

const ROLES: PreviewRole[] = [ 'owner', 'member' ];
const AGENCIES: PreviewAgency[] = [ 'not-opted-in', 'opted-in', 'new' ];
const OVERLAYS: PreviewOverlay[] = [ 'not-now', 'menu', 'switch-back', 'back' ];

function readState(): OptInPreviewState {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_STATE;
	}
	const params = new URLSearchParams( window.location.search );
	const pick = < T >( value: string | null, allowed: T[], fallback: T ) =>
		allowed.includes( value as T ) ? ( value as T ) : fallback;
	return {
		role: pick( params.get( 'preview-role' ), ROLES, DEFAULT_STATE.role ),
		agency: pick( params.get( 'preview-agency' ), AGENCIES, DEFAULT_STATE.agency ),
		firstVisit: params.get( 'preview-first' ) !== '0',
		overlay: pick( params.get( 'preview-overlay' ), OVERLAYS, null ),
	};
}

export function toSearch( state: OptInPreviewState ) {
	const params = new URLSearchParams();
	params.set( 'preview-role', state.role );
	params.set( 'preview-agency', state.agency );
	params.set( 'preview-first', state.firstVisit ? '1' : '0' );
	if ( state.overlay ) {
		params.set( 'preview-overlay', state.overlay );
	}
	return params.toString();
}

let snapshot: OptInPreviewState = readState();
const listeners = new Set< () => void >();

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function setOptInPreview( changes: Partial< OptInPreviewState > ) {
	snapshot = { ...snapshot, ...changes };
	if ( typeof window !== 'undefined' ) {
		const url = new URL( window.location.href );
		const next = new URLSearchParams( toSearch( snapshot ) );
		for ( const key of [ ...url.searchParams.keys() ] ) {
			if ( key.startsWith( 'preview-' ) ) {
				url.searchParams.delete( key );
			}
		}
		next.forEach( ( value, key ) => url.searchParams.set( key, value ) );
		window.history.replaceState( window.history.state, '', url );
	}
	listeners.forEach( ( listener ) => listener() );
}

/**
 * The preview state, or null outside development so nothing here ships.
 */
export function useOptInPreview(): OptInPreviewState | null {
	const state = useSyncExternalStore(
		subscribe,
		() => snapshot,
		() => snapshot
	);
	return isOptInPreviewEnabled ? state : null;
}

export function currentApp(): PreviewApp {
	return typeof window !== 'undefined' && window.location.hostname.startsWith( 'my.a4a' )
		? 'dashboard'
		: 'classic';
}

// The local dev servers for the two apps: the new dashboard on 3001 and classic on 3002.
function originFor( app: PreviewApp ) {
	if ( typeof window === 'undefined' || currentApp() === app ) {
		return '';
	}
	const port = window.location.port;
	if ( app === 'dashboard' ) {
		return `${ window.location.protocol }//my.a4a.localhost:${ port === '3002' ? '3001' : port }`;
	}
	return `${ window.location.protocol }//agencies.localhost:${ port === '3001' ? '3002' : port }`;
}

export function previewUrl( app: PreviewApp, path: string, state: OptInPreviewState ) {
	return `${ originFor( app ) }${ path }?${ toSearch( state ) }`;
}

/**
 * Goes to a moment of the flow: in place when it is on this page, otherwise by link.
 */
export function goToStep( step: OptInStep, role: PreviewRole ) {
	const state = { ...step.state, role };
	if ( step.app === currentApp() && window.location.pathname === step.path ) {
		setOptInPreview( state );
		return;
	}
	window.location.href = previewUrl( step.app, step.path, state );
}

export function currentStepId( state: OptInPreviewState ) {
	const app = currentApp();
	const path = typeof window === 'undefined' ? '' : window.location.pathname;
	return OPT_IN_STEPS.find(
		( step ) =>
			step.app === app &&
			step.path === path &&
			step.state.agency === state.agency &&
			step.state.firstVisit === state.firstVisit &&
			step.state.overlay === state.overlay
	)?.id;
}
