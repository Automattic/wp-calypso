import type { BuildWowStreamEnvelope } from './types';

// Folds Engine build events (docs/events.md in site-builder-engine) into what
// the waiting screen shows. Unknown types and malformed payloads are ignored.
// Section HTML is discarded because generated markup needs its own isolated
// preview surface. Ready image paths are retained for image-only previews.

export type StreamPlanStatus = 'proposed' | 'developing' | 'completed';

export type StreamSwatch = { name: string; color: string };
export type StreamTypeface = { name: string; family: string; role: string | null };
export type StreamPage = { slug: string; title: string; sections: string[] };

// Engine plan fields keep their meaning: null is not decided yet, [] is none.
export type StreamPlan = {
	status: StreamPlanStatus;
	title: string | null;
	direction: string | null;
	palette: StreamSwatch[] | null;
	typography: StreamTypeface[] | null;
	pages: StreamPage[] | null;
	images: StreamPlanImage[] | null;
};

export type StreamPlanImage = { query: string; aspectRatio: string | null };

export type StreamSection = {
	kind: 'chrome' | 'content';
	name: string | null;
	partial: boolean;
};

export type StreamImageStatus = 'pending' | 'generating' | 'ready' | 'failed';
export type StreamImage = {
	status: StreamImageStatus;
	url: string | null;
	previewId?: string;
	query: string | null;
	aspectRatio: string | null;
};

export type BuildWowStreamState = {
	runId: string;
	cursor: number;
	attempt: number;
	// Times each host phase has started; a second start is a retry.
	phases: Record< string, number >;
	currentStep: string | null;
	directions: string[];
	plan: StreamPlan | null;
	sections: Record< string, Record< number, StreamSection > >;
	images: Record< string, StreamImage >;
	// The Engine finished its own work. Never a reason to navigate: Build Wow
	// still has to deliver the result, and only the status endpoint says live.
	engineTerminal: 'completed' | 'failed' | 'paused' | null;
};

const MAX_TEXT = 280;
const MAX_ITEMS = 24;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const IMAGE_STATUSES: StreamImageStatus[] = [ 'pending', 'generating', 'ready', 'failed' ];

export function initialStreamState( runId: string ): BuildWowStreamState {
	return {
		runId,
		cursor: 0,
		attempt: 1,
		phases: {},
		currentStep: null,
		directions: [],
		plan: null,
		sections: {},
		images: {},
		engineTerminal: null,
	};
}

function text( value: unknown, max = MAX_TEXT ): string | null {
	return typeof value === 'string' && value.trim() ? value.trim().slice( 0, max ) : null;
}

function list< T >( value: unknown, map: ( item: unknown ) => T | null ): T[] | null {
	if ( ! Array.isArray( value ) ) {
		return null;
	}
	return value
		.map( map )
		.filter( ( item ): item is T => item !== null )
		.slice( 0, MAX_ITEMS );
}

function record( value: unknown ): Record< string, unknown > | null {
	return typeof value === 'object' && value !== null && ! Array.isArray( value )
		? ( value as Record< string, unknown > )
		: null;
}

function parseSwatch( item: unknown ): StreamSwatch | null {
	const swatch = record( item );
	const color = text( swatch?.color, 7 );
	if ( ! swatch || ! color || ! HEX_COLOR.test( color ) ) {
		return null;
	}
	return { name: text( swatch.name, 40 ) ?? color, color };
}

function parseTypeface( item: unknown ): StreamTypeface | null {
	const face = record( item );
	const name = text( face?.name, 80 );
	const family = text( face?.family, 80 ) ?? name;
	if ( ! face || ! family ) {
		return null;
	}
	return { name: name ?? family, family, role: text( face.role, 40 ) };
}

function parsePage( item: unknown ): StreamPage | null {
	const page = record( item );
	const slug = text( page?.slug, 80 );
	if ( ! page || ! slug ) {
		return null;
	}
	return {
		slug,
		title: text( page.title, 100 ) ?? slug,
		sections: list( page.sections, ( name ) => text( name, 100 ) ) ?? [],
	};
}

function parsePlanImage( item: unknown ): StreamPlanImage | null {
	const image = record( item );
	const query = text( image?.query, 200 );
	if ( ! image || ! query ) {
		return null;
	}
	return { query, aspectRatio: text( image.aspectRatio, 20 ) };
}

function planFrom( data: Record< string, unknown >, status: StreamPlanStatus ): StreamPlan {
	return {
		status,
		title: text( data.title, 100 ),
		direction: text( data.direction ),
		palette: list( data.palette, parseSwatch ),
		typography: list( data.typography, parseTypeface ),
		pages: list( data.pages, parsePage ),
		images: list( data.images, parsePlanImage ),
	};
}

// A `proposed` update starts the board over; later updates only fill in what
// they decided, so a field that is still null keeps the earlier value.
function mergePlan( previous: StreamPlan | null, next: StreamPlan ): StreamPlan {
	if ( ! previous || next.status === 'proposed' || next.status === 'completed' ) {
		return next;
	}
	return {
		status: next.status,
		title: next.title ?? previous.title,
		direction: next.direction ?? previous.direction,
		palette: next.palette ?? previous.palette,
		typography: next.typography ?? previous.typography,
		pages: next.pages ?? previous.pages,
		images: next.images ?? previous.images,
	};
}

// A new attempt redoes planning and composition, so nothing it will replace
// may linger from the attempt before it.
function resetAttempt( state: BuildWowStreamState, attempt: number ): BuildWowStreamState {
	return {
		...initialStreamState( state.runId ),
		cursor: state.cursor,
		attempt,
		phases: state.phases,
	};
}

// What each Build Wow phase produces, mirroring the host's snapshot fold
// (Build_Stream_Store::reset_for_retry in wpcom): a retried phase drops its
// earlier output, so a re-planned site cannot keep stale sections.
const PHASE_OUTPUTS: Record< string, Array< 'plan' | 'sections' | 'images' > > = {
	prepare: [ 'plan', 'sections', 'images' ],
	finish_apply: [ 'sections', 'images' ],
};

function resetPhase( state: BuildWowStreamState, phase: string ): BuildWowStreamState {
	const next = { ...state };
	for ( const output of PHASE_OUTPUTS[ phase ] ?? [] ) {
		if ( output === 'plan' ) {
			next.plan = null;
			next.directions = [];
		} else {
			next[ output ] = {};
		}
	}
	return next;
}

// PHP serializes an empty keyed map as [], and a list may come either way.
function values( value: unknown ): unknown[] {
	if ( Array.isArray( value ) ) {
		return value;
	}
	const map = record( value );
	return map ? Object.values( map ) : [];
}

export function applyStreamEvent(
	state: BuildWowStreamState,
	type: string,
	data: Record< string, unknown >
): BuildWowStreamState {
	switch ( type ) {
		case 'phase.started': {
			const phase = text( data.phase, 80 );
			if ( ! phase ) {
				return state;
			}
			const starts = ( state.phases[ phase ] ?? 0 ) + 1;
			// Like the host's fold, a phase start has no step running yet.
			const next = {
				...state,
				phases: { ...state.phases, [ phase ]: starts },
				currentStep: null,
				engineTerminal: null,
			};
			return starts > 1 ? resetPhase( next, phase ) : next;
		}
		case 'step.started':
			return { ...state, currentStep: text( data.label, 100 ) ?? state.currentStep };
		case 'exploration.completed':
			return {
				...state,
				directions:
					list( data.routes, ( route ) => text( record( route )?.name, 100 ) ) ?? state.directions,
			};
		case 'plan.updated': {
			const status = data.status === 'proposed' ? 'proposed' : 'developing';
			return { ...state, plan: mergePlan( state.plan, planFrom( data, status ) ) };
		}
		case 'plan.completed':
			return { ...state, plan: planFrom( data, 'completed' ) };
		case 'section.updated': {
			const route = text( data.route, 200 );
			const position = data.position;
			if ( ! route || typeof position !== 'number' || ! Number.isInteger( position ) ) {
				return state;
			}
			if ( position < 0 || position >= MAX_ITEMS ) {
				return state;
			}
			const routeSections = state.sections[ route ];
			if ( ! routeSections && Object.keys( state.sections ).length >= MAX_ITEMS ) {
				return state;
			}
			return {
				...state,
				sections: {
					...state.sections,
					[ route ]: {
						...routeSections,
						[ position ]: {
							kind: data.kind === 'chrome' ? 'chrome' : 'content',
							name: text( data.name, 100 ),
							partial: data.partial === true,
						},
					},
				},
			};
		}
		case 'image.updated': {
			const id = text( data.id, 200 );
			const status = IMAGE_STATUSES.find( ( item ) => item === data.status );
			if ( ! id || ! status ) {
				return state;
			}
			if ( ! ( id in state.images ) && Object.keys( state.images ).length >= MAX_ITEMS ) {
				return state;
			}
			const rawUrl = text( data.url, 2048 );
			const previewId = text( data.preview_id, 64 );
			const url = rawUrl?.startsWith( '/wp-content/themes/' ) ? rawUrl : null;
			return {
				...state,
				images: {
					...state.images,
					[ id ]: {
						status,
						url: status === 'ready' ? url : null,
						...( status === 'ready' && previewId && /^[a-f0-9]{64}$/.test( previewId )
							? { previewId }
							: {} ),
						query: text( data.query, 200 ),
						aspectRatio: text( data.aspectRatio, 20 ),
					},
				},
			};
		}
		case 'build.completed':
			return { ...state, engineTerminal: 'completed', currentStep: null };
		case 'build.failed':
			return { ...state, engineTerminal: 'failed', currentStep: null };
		case 'build.paused':
			return { ...state, engineTerminal: 'paused', currentStep: null };
		default:
			return state;
	}
}

export function applyEnvelope(
	state: BuildWowStreamState,
	envelope: BuildWowStreamEnvelope
): BuildWowStreamState {
	const base =
		envelope.attempt !== undefined && envelope.attempt > state.attempt
			? resetAttempt( state, envelope.attempt )
			: state;
	return { ...applyStreamEvent( base, envelope.type, envelope.data ), cursor: envelope.seq };
}

/**
 * Rebuilds state from the host's folded snapshot (Build_Stream_Store::fold in
 * wpcom): `attempt`, `terminal` (null|completed|failed), `current_step`,
 * `phases` ({ [phase]: { attempt } }), `exploration`, `plan` (with `status`
 * proposed|developing|completed), and `sections` / `images` (objects keyed by
 * route#position and image id holding section.updated / image.updated data;
 * lists are accepted too). Older shapes fall back to `status`, `result`,
 * `error`, and the last started entry of `steps`. Unknown keys are ignored
 * and missing ones leave that part empty.
 */
export function stateFromSnapshot(
	runId: string,
	cursor: number,
	snapshot: Record< string, unknown >
): BuildWowStreamState {
	let state = initialStreamState( runId );
	const attempt = snapshot.attempt;
	if ( typeof attempt === 'number' && Number.isInteger( attempt ) && attempt > 0 ) {
		state.attempt = attempt;
	}

	const phases = record( snapshot.phases );
	for ( const [ phase, value ] of Object.entries( phases ?? {} ) ) {
		const starts = record( value )?.attempt;
		if ( typeof starts === 'number' && Number.isInteger( starts ) && starts > 0 ) {
			state.phases[ phase ] = starts;
		}
	}
	// Events carry the run's attempt, so the snapshot must start from the same
	// one or the next event would look like a retry and erase the plan. Only a
	// prepare retry raises it, so that phase's count stands in when the
	// snapshot predates the explicit key.
	if ( ! ( typeof attempt === 'number' && attempt > 0 ) && state.phases.prepare ) {
		state.attempt = state.phases.prepare;
	}

	const exploration = record( snapshot.exploration );
	if ( exploration ) {
		state = applyStreamEvent( state, 'exploration.completed', exploration );
	}
	const plan = record( snapshot.plan );
	if ( plan ) {
		const isDeveloping = plan.status === 'proposed' || plan.status === 'developing';
		state = applyStreamEvent( state, isDeveloping ? 'plan.updated' : 'plan.completed', plan );
	}
	for ( const section of values( snapshot.sections ) ) {
		const data = record( section );
		if ( data ) {
			state = applyStreamEvent( state, 'section.updated', data );
		}
	}
	for ( const image of values( snapshot.images ) ) {
		const data = record( image );
		if ( data ) {
			state = applyStreamEvent( state, 'image.updated', data );
		}
	}

	let currentStep = text( snapshot.current_step, 100 );
	if ( ! currentStep && ! ( 'current_step' in snapshot ) ) {
		// The step still running is the last one started and not yet finished.
		for ( const step of values( snapshot.steps ) ) {
			const data = record( step );
			if ( data?.status === 'started' ) {
				currentStep = text( data.label, 100 ) ?? currentStep;
			}
		}
	}

	let engineTerminal: BuildWowStreamState[ 'engineTerminal' ] = null;
	const terminal = 'terminal' in snapshot ? snapshot.terminal : snapshot.status;
	if ( terminal === 'completed' || terminal === 'failed' ) {
		engineTerminal = terminal;
	} else if ( ! ( 'terminal' in snapshot ) ) {
		if ( record( snapshot.error ) ) {
			engineTerminal = 'failed';
		} else if ( record( snapshot.result ) ) {
			engineTerminal = 'completed';
		}
	}

	return {
		...state,
		currentStep: engineTerminal ? null : currentStep,
		engineTerminal,
		cursor,
	};
}
