import type { CampaignBrief, ManualCampaignFields, BeaDirection } from './bea';

export type BeaSourceItemType = 'angle' | 'headline' | 'eyebrow' | 'dek' | 'cta' | 'quote' | 'stat';

export type BeaSourceItem = {
	id: string;
	type: BeaSourceItemType;
	text: string;
};

export type BeaAddedItem = {
	directionIdx: number;
	variantLabel: string;
	slot: string;
	text: string;
};

export type BeaCoverageResult = {
	complete: boolean;
	covered: BeaSourceItem[];
	missing: BeaSourceItem[];
};

export type BeaAdditionsResult = {
	clean: boolean;
	added: BeaAddedItem[];
};

export type BeaRepeatedItem = {
	directionIdx: number;
	variantLabel: string;
	slots: string[];
	text: string;
};

export type BeaRepetitionResult = {
	clean: boolean;
	repeated: BeaRepeatedItem[];
};

const STOPWORDS = new Set( [
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'can',
	'for',
	'from',
	'has',
	'have',
	'in',
	'is',
	'it',
	'its',
	'of',
	'on',
	'or',
	'that',
	'the',
	'their',
	'this',
	'to',
	'with',
] );

const COVERAGE_THRESHOLD = 0.66;
const ADDITION_MIN_WORDS = 4;
const ADDITION_MIN_OVERLAP = 0.5;

// Slots whose text the LLM is free to set without grounding (chrome / framing).
// These are corner labels, attribution lines, and brand-derived bits — they
// should never be flagged as "modified" content because they're meta, not
// the campaign claim itself.
const ADDITION_IGNORED_SLOTS = new Set( [
	'tlLabel',
	'trLabel',
	'blLabel',
	'brLabel',
	'quoteAttribution',
	'statValue',
	'statLabel',
] );

// Slots that carry user-facing claims and should be traceable to the brief.
const ADDITION_CHECKED_SLOTS = new Set( [ 'headline', 'eyebrow', 'dek', 'cta', 'quote' ] );

const REPETITION_CHECKED_SLOTS = [ 'headline', 'dek', 'quote', 'statLabel', 'cta' ] as const;

export function briefToSourceItems( brief: CampaignBrief ): BeaSourceItem[] {
	const items: BeaSourceItem[] = [];
	const seen = new Set< string >();
	let counter = 0;
	const push = ( type: BeaSourceItemType, text: string ) => {
		const cleaned = ( text ?? '' ).trim();
		if ( ! cleaned ) {
			return;
		}
		const key = `${ type }:${ normalize( cleaned ) }`;
		if ( ! key || seen.has( key ) ) {
			return;
		}
		seen.add( key );
		items.push( { id: `${ type }-${ ++counter }`, type, text: cleaned } );
	};
	push( 'angle', brief.primaryAngle );
	push( 'headline', brief.headlines[ 0 ] ?? brief.sourceTitle );
	push( 'eyebrow', brief.eyebrowOptions[ 0 ] ?? '' );
	push( 'dek', brief.dekOptions[ 0 ] ?? brief.sourceSummary );
	push( 'cta', brief.ctas[ 0 ] ?? '' );
	for ( const quote of brief.quotes ) {
		push( 'quote', quote.text );
	}
	for ( const stat of brief.stats ) {
		push( 'stat', stat.value );
	}
	return items;
}

export function campaignInputToSourceItems( args: {
	sourceText?: string;
	manualFields?: ManualCampaignFields;
	fallbackBrief: CampaignBrief;
} ): BeaSourceItem[] {
	if ( args.sourceText?.trim() ) {
		const items: BeaSourceItem[] = [];
		const seen = new Set< string >();
		let counter = 0;
		const push = ( type: BeaSourceItemType, text: string ) => {
			const cleaned = ( text ?? '' ).trim();
			if ( ! cleaned || cleaned.length < 3 ) {
				return;
			}
			const key = `${ type }:${ normalize( cleaned ) }`;
			if ( seen.has( key ) ) {
				return;
			}
			seen.add( key );
			items.push( { id: `${ type }-${ ++counter }`, type, text: cleaned } );
		};

		const paragraphs = args.sourceText
			.split( /\n\s*\n/g )
			.map( ( item ) => item.trim() )
			.filter( Boolean );
		for ( const paragraph of paragraphs ) {
			const lines = paragraph
				.split( /\r?\n/g )
				.map( ( line ) => line.trim() )
				.filter( Boolean );
			if ( lines.length === 1 && lines[ 0 ].length <= 90 ) {
				push( 'headline', lines[ 0 ].replace( /^#+\s*/, '' ) );
				continue;
			}
			for ( const line of lines ) {
				const cleaned = line.replace( /^#+\s*/, '' );
				if ( cleaned.length <= 90 ) {
					push( 'headline', cleaned );
				} else {
					push( 'dek', cleaned );
				}
			}
		}
		return items.length ? items : briefToSourceItems( args.fallbackBrief );
	}

	const manual = args.manualFields;
	if ( ! manual ) {
		return briefToSourceItems( args.fallbackBrief );
	}

	const items: BeaSourceItem[] = [];
	const push = ( type: BeaSourceItemType, text: string | undefined ) => {
		const cleaned = ( text ?? '' ).trim();
		if ( ! cleaned ) {
			return;
		}
		items.push( { id: `${ type }-${ items.length + 1 }`, type, text: cleaned } );
	};
	push( 'headline', manual.title );
	push( 'eyebrow', manual.eyebrow );
	push( 'quote', manual.quote );
	push( 'stat', manual.stat );
	push( 'dek', manual.statContext );
	push( 'cta', manual.cta );
	return items.length ? items : briefToSourceItems( args.fallbackBrief );
}

export function checkBeaCoverage(
	source: CampaignBrief | BeaSourceItem[],
	directions: BeaDirection[]
): BeaCoverageResult {
	const items = Array.isArray( source ) ? source : briefToSourceItems( source );
	const outputText = directions
		.flatMap( ( dir ) => Object.values( dir.slots ) )
		.filter( ( value ): value is string => Boolean( value ) )
		.join( ' ' );
	const normalizedOutput = normalize( outputText );
	const outputTokens = new Set( tokenize( outputText ) );

	const covered: BeaSourceItem[] = [];
	const missing: BeaSourceItem[] = [];
	for ( const item of items ) {
		if ( isItemCovered( item, normalizedOutput, outputTokens ) ) {
			covered.push( item );
		} else {
			missing.push( item );
		}
	}
	return { complete: missing.length === 0, covered, missing };
}

export function checkBeaAdditions(
	source: CampaignBrief | BeaSourceItem[],
	directions: BeaDirection[]
): BeaAdditionsResult {
	const sourceItems = Array.isArray( source ) ? source : briefToSourceItems( source );
	const sourceTokenSets = sourceItems.map( ( item ) => new Set( tokenize( item.text ) ) );
	// Also include the raw brief headlines/eyebrows/deks/ctas/quotes (not just
	// the top option) so alternates count as grounded.
	if ( ! Array.isArray( source ) ) {
		for ( const text of [
			...source.headlines,
			...source.eyebrowOptions,
			...source.dekOptions,
			...source.ctas,
			...source.alternateAngles,
			...source.quotes.map( ( q ) => q.text ),
			source.sourceTitle,
			source.sourceSummary,
		] ) {
			const tokens = tokenize( text ?? '' );
			if ( tokens.length ) {
				sourceTokenSets.push( new Set( tokens ) );
			}
		}
	}

	const added: BeaAddedItem[] = [];
	directions.forEach( ( dir, directionIdx ) => {
		for ( const [ slot, value ] of Object.entries( dir.slots ) ) {
			if ( ! ADDITION_CHECKED_SLOTS.has( slot ) ) {
				continue;
			}
			if ( ADDITION_IGNORED_SLOTS.has( slot ) ) {
				continue;
			}
			const text = ( value ?? '' ).trim();
			if ( ! text ) {
				continue;
			}
			const tokens = tokenize( text );
			if ( tokens.length < ADDITION_MIN_WORDS ) {
				continue;
			}
			const overlap = bestOverlap( tokens, sourceTokenSets );
			if ( overlap < ADDITION_MIN_OVERLAP ) {
				added.push( { directionIdx, variantLabel: dir.variantLabel, slot, text } );
			}
		}
	} );
	return { clean: added.length === 0, added };
}

export function checkBeaRepetition( directions: BeaDirection[] ): BeaRepetitionResult {
	const repeated: BeaRepeatedItem[] = [];

	directions.forEach( ( dir, directionIdx ) => {
		const seen: Array< { slot: string; text: string; normalized: string; tokens: Set< string > } > =
			[];
		for ( const slot of REPETITION_CHECKED_SLOTS ) {
			const text = ( dir.slots[ slot ] ?? '' ).trim();
			if ( ! text ) {
				continue;
			}
			const normalized = normalize( text );
			if ( ! normalized ) {
				continue;
			}
			const tokens = new Set( tokenize( text ) );

			const match = seen.find( ( item ) =>
				areTextsTooSimilar(
					{ text, normalized, tokens },
					{ text: item.text, normalized: item.normalized, tokens: item.tokens }
				)
			);

			if ( match ) {
				repeated.push( {
					directionIdx,
					variantLabel: dir.variantLabel,
					slots: [ match.slot, slot ],
					text,
				} );
				continue;
			}

			seen.push( { slot, text, normalized, tokens } );
		}
	} );

	return { clean: repeated.length === 0, repeated };
}

export function formatMissingBeaItems( items: BeaSourceItem[], limit = 12 ): string {
	return items
		.slice( 0, limit )
		.map( ( item, i ) => `${ i + 1 }. [${ item.type }] ${ item.text }` )
		.join( '\n' );
}

export function formatAddedBeaItems( items: BeaAddedItem[], limit = 12 ): string {
	return items
		.slice( 0, limit )
		.map( ( item, i ) => `${ i + 1 }. [${ item.variantLabel } · ${ item.slot }] ${ item.text }` )
		.join( '\n' );
}

export function formatRepeatedBeaItems( items: BeaRepeatedItem[], limit = 12 ): string {
	return items
		.slice( 0, limit )
		.map(
			( item, i ) =>
				`${ i + 1 }. [${ item.variantLabel } · ${ item.slots.join( ' + ' ) }] ${ item.text }`
		)
		.join( '\n' );
}

function isItemCovered(
	item: BeaSourceItem,
	normalizedOutput: string,
	outputTokens: Set< string >
): boolean {
	const normalizedItem = normalize( item.text );
	if ( ! normalizedItem ) {
		return true;
	}
	if ( normalizedOutput.includes( normalizedItem ) ) {
		return true;
	}
	if ( item.type === 'stat' ) {
		return normalizedOutput.includes( normalizedItem.replace( /\s+/g, ' ' ) );
	}
	const threshold = item.type === 'headline' || item.type === 'cta' ? 0.75 : COVERAGE_THRESHOLD;
	return tokenCoverage( item.text, outputTokens ) >= threshold;
}

function bestOverlap( tokens: string[], sourceTokenSets: Array< Set< string > > ): number {
	if ( sourceTokenSets.length === 0 || tokens.length === 0 ) {
		return 0;
	}
	let best = 0;
	for ( const set of sourceTokenSets ) {
		if ( ! set.size ) {
			continue;
		}
		let hits = 0;
		for ( const token of tokens ) {
			if ( set.has( token ) ) {
				hits += 1;
			}
		}
		const overlap = hits / tokens.length;
		if ( overlap > best ) {
			best = overlap;
		}
		if ( best >= 1 ) {
			break;
		}
	}
	return best;
}

function tokenCoverage( text: string, outputTokens: Set< string > ): number {
	const tokens = tokenize( text );
	if ( ! tokens.length ) {
		return 1;
	}
	let hits = 0;
	for ( const token of tokens ) {
		if ( outputTokens.has( token ) ) {
			hits += 1;
		}
	}
	return hits / tokens.length;
}

function areTextsTooSimilar(
	a: { text: string; normalized: string; tokens: Set< string > },
	b: { text: string; normalized: string; tokens: Set< string > }
): boolean {
	if ( a.normalized === b.normalized ) {
		return true;
	}
	if ( a.normalized.includes( b.normalized ) || b.normalized.includes( a.normalized ) ) {
		const shorter = Math.min( a.normalized.length, b.normalized.length );
		if ( shorter >= 12 ) {
			return true;
		}
	}

	const overlap = tokenSetOverlap( a.tokens, b.tokens );
	return overlap >= 0.8;
}

function tokenSetOverlap( a: Set< string >, b: Set< string > ): number {
	const smaller = a.size <= b.size ? a : b;
	const larger = a.size <= b.size ? b : a;
	if ( ! smaller.size ) {
		return 0;
	}
	let hits = 0;
	for ( const token of smaller ) {
		if ( larger.has( token ) ) {
			hits += 1;
		}
	}
	return hits / smaller.size;
}

function tokenize( text: string ): string[] {
	return normalize( text )
		.split( ' ' )
		.filter( ( token ) => token.length > 2 && ! STOPWORDS.has( token ) );
}

function normalize( text: string ): string {
	return text
		.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /[^a-z0-9$%.:]+/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();
}
