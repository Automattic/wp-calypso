/**
 * Presentation experiment for the Jetpack AI free-credit balance.
 *
 * There is no backend behind this: the balance is seeded from URL params and
 * mutated locally so the four surfaces can be compared against a live sidebar.
 * Replace `readInitialState` with the real entitlement source before shipping.
 */

export const FREE_CREDITS_SURFACES = [ 'pill', 'banner', 'card', 'exhausted' ] as const;

export type FreeCreditsSurface = ( typeof FREE_CREDITS_SURFACES )[ number ];

export interface FreeCreditsState {
	enabled: boolean;
	remaining: number;
	total: number;
	surfaces: FreeCreditsSurface[];
}

export interface FreeCreditsExperimentApi {
	get: () => FreeCreditsState;
	set: ( next: Partial< FreeCreditsState > ) => void;
	consume: ( amount?: number ) => void;
	reset: () => void;
	surfaces: readonly FreeCreditsSurface[];
}

const CHANGE_EVENT = 'agents-manager-free-credits-change';
const STORAGE_KEY = 'agents-manager-free-credits-experiment';

const REMAINING_PARAM = 'ai-credits';
const TOTAL_PARAM = 'ai-credits-total';
const SURFACES_PARAM = 'ai-credits-ui';

const DEFAULT_TOTAL = 20;

const DISABLED_STATE: FreeCreditsState = {
	enabled: false,
	remaining: DEFAULT_TOTAL,
	total: DEFAULT_TOTAL,
	surfaces: [],
};

function isSurface( value: string ): value is FreeCreditsSurface {
	return ( FREE_CREDITS_SURFACES as readonly string[] ).includes( value );
}

function parseSurfaces( raw: string | null ): FreeCreditsSurface[] {
	if ( raw === null ) {
		return [ ...FREE_CREDITS_SURFACES ];
	}

	const normalized = raw.trim().toLowerCase();
	if ( normalized === 'all' ) {
		return [ ...FREE_CREDITS_SURFACES ];
	}
	if ( normalized === 'none' ) {
		return [];
	}

	return normalized
		.split( ',' )
		.map( ( entry ) => entry.trim() )
		.filter( isSurface );
}

function parseCount( raw: string | null, fallback: number ): number {
	if ( raw === null ) {
		return fallback;
	}

	const parsed = Number.parseInt( raw, 10 );
	return Number.isFinite( parsed ) && parsed >= 0 ? parsed : fallback;
}

function clampState( state: FreeCreditsState ): FreeCreditsState {
	const total = Math.max( 1, state.total );
	return {
		...state,
		total,
		remaining: Math.min( Math.max( 0, state.remaining ), total ),
	};
}

function readStoredState(): FreeCreditsState | null {
	try {
		const raw = window.sessionStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return null;
		}

		const parsed = JSON.parse( raw );
		if ( ! parsed || typeof parsed !== 'object' ) {
			return null;
		}

		return clampState( {
			enabled: parsed.enabled !== false,
			remaining: parseCount( String( parsed.remaining ), DEFAULT_TOTAL ),
			total: parseCount( String( parsed.total ), DEFAULT_TOTAL ),
			surfaces: Array.isArray( parsed.surfaces ) ? parsed.surfaces.filter( isSurface ) : [],
		} );
	} catch {
		return null;
	}
}

function persistState( state: FreeCreditsState ): void {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( state ) );
	} catch {
		// Private-mode storage failures are not worth surfacing in a prototype.
	}
}

/**
 * URL params win over the persisted session so a fresh link always shows what
 * it says. Without any param the experiment stays off and the sidebar renders
 * exactly as it does today.
 */
function readInitialState(): FreeCreditsState {
	if ( typeof window === 'undefined' ) {
		return DISABLED_STATE;
	}

	const params = new URLSearchParams( window.location.search );
	const remainingParam = params.get( REMAINING_PARAM );
	const totalParam = params.get( TOTAL_PARAM );
	const surfacesParam = params.get( SURFACES_PARAM );

	if ( remainingParam === null && totalParam === null && surfacesParam === null ) {
		return readStoredState() ?? DISABLED_STATE;
	}

	const total = parseCount( totalParam, DEFAULT_TOTAL );
	return clampState( {
		enabled: true,
		total,
		remaining: parseCount( remainingParam, total ),
		surfaces: parseSurfaces( surfacesParam ),
	} );
}

let state: FreeCreditsState | null = null;

function ensureState(): FreeCreditsState {
	if ( state === null ) {
		state = readInitialState();
	}
	return state;
}

export function getFreeCreditsState(): FreeCreditsState {
	return ensureState();
}

export function subscribeToFreeCredits( listener: () => void ): () => void {
	window.addEventListener( CHANGE_EVENT, listener );
	return () => window.removeEventListener( CHANGE_EVENT, listener );
}

export function setFreeCreditsState( next: Partial< FreeCreditsState > ): void {
	const current = ensureState();
	const merged = clampState( { ...current, ...next } );

	if (
		merged.enabled === current.enabled &&
		merged.remaining === current.remaining &&
		merged.total === current.total &&
		merged.surfaces.join() === current.surfaces.join()
	) {
		return;
	}

	state = merged;
	persistState( merged );
	window.dispatchEvent( new CustomEvent( CHANGE_EVENT ) );
}

export function consumeFreeCredit( amount = 1 ): void {
	const current = ensureState();
	if ( ! current.enabled ) {
		return;
	}

	setFreeCreditsState( { remaining: current.remaining - amount } );
}

export function resetFreeCredits(): void {
	const current = ensureState();
	setFreeCreditsState( { remaining: current.total } );
}

export function registerFreeCreditsExperimentApi(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.__agentsManagerFreeCredits = {
		get: getFreeCreditsState,
		set: setFreeCreditsState,
		consume: consumeFreeCredit,
		reset: resetFreeCredits,
		surfaces: FREE_CREDITS_SURFACES,
	};
}
