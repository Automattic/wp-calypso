import type { BuildWowFeedDelta, BuildWowFeedEvent } from './build-feed';

// Fold for the live-build feed: deltas in, one renderable snapshot out.
//
// Events are idempotent, writer-sequenced upserts, so the fold is a pure
// last-write-wins merge keyed by event type (and part key for sections).
// Replaying the whole feed from seq 0 — which the reader does after a
// superseded run or a page reload — produces the same snapshot.
//
// Every field is optional and every read is defensive: the payloads are
// server-capped plain text derived from model output, and a missing or
// odd-shaped field must cost a decoration, never a render error.

export type LiveBuildSection = {
	key: string;
	part: 'header' | 'footer' | 'section';
	page: string;
	section: string;
	heading?: string;
	text?: string;
	buttons?: string[];
	images?: Array< { subject?: string; style?: string; aspect?: string } >;
};

export type LiveBuildPage = {
	slug: string;
	title: string;
	front?: boolean;
	sections?: Array< { slug?: string; title?: string; type?: string; action_label?: string } >;
};

export type LiveBuildState = {
	identity?: { title?: string; description?: string };
	design?: {
		title?: string;
		description?: string;
		palette?: string[];
		headingFont?: string;
		bodyFont?: string;
		cardStyle?: string;
		shape?: string;
	};
	colors?: Array< { slug?: string; name?: string; color: string } >;
	fonts?: Array< { slug?: string; name?: string; fontFamily?: string } >;
	pages?: LiveBuildPage[];
	planKeys?: string[];
	sections: Record< string, LiveBuildSection >;
	imagesPlanned?: { count?: number; subjects?: string[] };
	designAssets: { home?: string; css?: string; preview?: string };
};

export const EMPTY_LIVE_BUILD_STATE: LiveBuildState = {
	sections: {},
	designAssets: {},
};

const asString = ( value: unknown ): string | undefined =>
	typeof value === 'string' && value !== '' ? value : undefined;

const asStringArray = ( value: unknown ): string[] | undefined =>
	Array.isArray( value )
		? ( value.filter( ( entry ) => typeof entry === 'string' && entry !== '' ) as string[] )
		: undefined;

function foldEvent(
	state: LiveBuildState,
	event: BuildWowFeedEvent,
	assets: Record< string, string >
): LiveBuildState {
	const data = ( event.data ?? {} ) as Record< string, unknown >;

	switch ( event.type ) {
		case 'identity':
			return {
				...state,
				identity: { title: asString( data.title ), description: asString( data.description ) },
			};

		case 'design_direction':
			return {
				...state,
				design: {
					title: asString( data.title ),
					description: asString( data.description ),
					palette: asStringArray( data.palette ),
					headingFont: asString( data.heading_font ),
					bodyFont: asString( data.body_font ),
					cardStyle: asString( data.card_style ),
					shape: asString( data.shape ),
				},
			};

		case 'palette': {
			const colors = Array.isArray( data.colors )
				? ( data.colors as Array< Record< string, unknown > > )
						.map( ( entry ) => ( {
							slug: asString( entry.slug ),
							name: asString( entry.name ),
							color: asString( entry.color ) ?? '',
						} ) )
						.filter( ( entry ) => entry.color !== '' )
				: undefined;
			return colors?.length ? { ...state, colors } : state;
		}

		case 'fonts': {
			const fonts = Array.isArray( data.families )
				? ( data.families as Array< Record< string, unknown > > ).map( ( entry ) => ( {
						slug: asString( entry.slug ),
						name: asString( entry.name ),
						fontFamily: asString( entry.fontFamily ),
				  } ) )
				: undefined;
			return fonts?.length ? { ...state, fonts } : state;
		}

		case 'page_plan': {
			const pages = Array.isArray( data.pages )
				? ( data.pages as Array< Record< string, unknown > > )
						.map( ( entry ) => ( {
							slug: asString( entry.slug ) ?? '',
							title: asString( entry.title ) ?? '',
							front: entry.front === true,
							sections: Array.isArray( entry.sections )
								? ( entry.sections as Array< Record< string, unknown > > ).map( ( section ) => ( {
										slug: asString( section.slug ),
										title: asString( section.title ),
										type: asString( section.type ),
										action_label: asString( section.action_label ),
								  } ) )
								: undefined,
						} ) )
						.filter( ( page ) => page.slug !== '' || page.title !== '' )
				: undefined;
			return pages?.length ? { ...state, pages } : state;
		}

		case 'plan_keys': {
			const keys = asStringArray( data.keys );
			return keys?.length ? { ...state, planKeys: keys } : state;
		}

		case 'section': {
			if ( ! event.key ) {
				return state;
			}
			const part = data.part === 'header' || data.part === 'footer' ? data.part : 'section';
			const images = Array.isArray( data.images )
				? ( data.images as Array< Record< string, unknown > > ).map( ( image ) => ( {
						subject: asString( image.subject ),
						style: asString( image.style ),
						aspect: asString( image.aspect ),
				  } ) )
				: undefined;
			return {
				...state,
				sections: {
					...state.sections,
					[ event.key ]: {
						key: event.key,
						part,
						page: asString( data.page ) ?? '',
						section: asString( data.section ) ?? event.key,
						heading: asString( data.heading ),
						text: asString( data.text ),
						buttons: asStringArray( data.buttons ),
						images,
					},
				},
			};
		}

		case 'images_planned':
			return {
				...state,
				imagesPlanned: {
					count: typeof data.count === 'number' ? data.count : undefined,
					subjects: asStringArray( data.subjects ),
				},
			};

		case 'design_asset': {
			const ref = asString( data.ref );
			const content = ref ? assets[ ref ] : undefined;
			if ( ! ref || ! content ) {
				return state;
			}
			if ( ref === 'design_home' ) {
				return { ...state, designAssets: { ...state.designAssets, home: content } };
			}
			if ( ref === 'design_css' ) {
				return { ...state, designAssets: { ...state.designAssets, css: content } };
			}
			if ( ref === 'design_preview' ) {
				return { ...state, designAssets: { ...state.designAssets, preview: content } };
			}
			return state;
		}

		default:
			// Forward compatibility: unknown event types fold to nothing rather
			// than breaking the screen when the backend learns a new trick.
			return state;
	}
}

export function foldFeedDelta( state: LiveBuildState, delta: BuildWowFeedDelta ): LiveBuildState {
	// A superseded run (retry) restarts the story from scratch.
	let next = delta.reset ? EMPTY_LIVE_BUILD_STATE : state;
	const assets = delta.assets ?? {};
	for ( const event of delta.events ?? [] ) {
		next = foldEvent( next, event, assets );
	}
	return next;
}
