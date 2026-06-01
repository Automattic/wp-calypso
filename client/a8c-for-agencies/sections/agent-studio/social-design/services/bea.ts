/* eslint-disable no-nested-ternary */
import {
	BEA_LAYOUT_FAMILIES,
	type BeaLayoutFamily,
	type BeaTitleLengthBucket,
	type BeaTheme,
} from './beaLayouts';
import type { BrandPack } from '../brandPacks/types';

// Brief extraction has moved server-side (the wpcom
// `a4a/bea-extract-brief` ability). This module is the deterministic
// projector that turns an already-extracted CampaignBrief into N
// layout directions; no LLM call from the browser anymore.

export type CampaignGoal =
	| 'drive-read'
	| 'announce'
	| 'promote-offer'
	| 'event'
	| 'case-study'
	| 'sales-enable';

export type CampaignBrief = {
	sourceTitle: string;
	sourceSummary: string;
	primaryAngle: string;
	alternateAngles: string[];
	audience?: string;
	campaignGoal: CampaignGoal;
	headlines: string[];
	eyebrowOptions: string[];
	dekOptions: string[];
	quotes: Array< { text: string; attribution?: string } >;
	stats: Array< { value: string; label: string; context: string } >;
	ctas: string[];
	imageNotes?: string;
};

export type ManualCampaignFields = {
	title: string;
	eyebrow?: string;
	quote?: string;
	quoteAttribution?: string;
	stat?: string;
	statContext?: string;
	cta?: string;
	domain?: string;
};

export type BeaDirection = {
	variantLabel: string;
	layoutFamilyId: string;
	angle: string;
	theme: BeaTheme;
	slots: Record< string, string >;
	imageAssignments?: Record< string, number >;
	rationale?: string;
};

export type BeaGenerationResult = {
	brief: CampaignBrief;
	directions: BeaDirection[];
};

type BeaSignals = {
	imageCount: number;
	hasQuote: boolean;
	hasStat: boolean;
	hasEyebrow: boolean;
	hasCta: boolean;
	sourceTitleLength: number;
	titleBucket: BeaTitleLengthBucket;
	goal: CampaignGoal;
	headlineCandidates: string[];
	dekCandidates: string[];
	summaryLength: number;
};

type FamilyScore = {
	family: BeaLayoutFamily;
	score: number;
	rationale: string;
};

function clean( value: unknown ): string {
	return typeof value === 'string' ? value.trim() : '';
}

function truncate( value: string, max: number ): string {
	const text = value.trim();
	if ( text.length <= max ) {
		return text;
	}
	return text.slice( 0, Math.max( 0, max - 1 ) ).trimEnd() + '…';
}

// Trim a phrase to a word boundary with no ellipsis. Used for stat labels,
// which read as captions and look broken when cut mid-word.
function clampPhrase( value: string, max: number ): string {
	const text = clean( value ).replace( /\s+/g, ' ' );
	if ( text.length <= max ) {
		return text;
	}
	const cut = text.slice( 0, max );
	const lastSpace = cut.lastIndexOf( ' ' );
	return ( lastSpace > max * 0.5 ? cut.slice( 0, lastSpace ) : cut ).trim();
}

export function campaignBriefFromManual( fields: ManualCampaignFields ): CampaignBrief {
	const title = truncate( fields.title || 'Campaign graphics', 120 );
	const eyebrow = fields.eyebrow || '';
	const stat = fields.stat?.trim();
	return {
		sourceTitle: title,
		sourceSummary: fields.statContext || fields.quote || title,
		primaryAngle: title,
		alternateAngles: [ title, fields.statContext || fields.quote || title ],
		campaignGoal: 'drive-read',
		headlines: [ title, title ],
		eyebrowOptions: eyebrow ? [ truncate( eyebrow, 24 ) ] : [],
		dekOptions: [ truncate( fields.statContext || fields.quote || '', 140 ) ],
		quotes: fields.quote
			? [ { text: truncate( fields.quote, 140 ), attribution: fields.quoteAttribution } ]
			: [],
		stats: stat
			? [
					{
						value: truncate( stat, 14 ),
						// The user's stat context is the explanation of the figure; use a
						// word-boundary clamp of it as the short caption label.
						label: clampPhrase( fields.statContext || '', 36 ),
						context: truncate( fields.statContext || title, 90 ),
					},
			  ]
			: [],
		ctas: fields.cta ? [ truncate( fields.cta, 22 ) ] : [],
	};
}

export function titleLengthBucket( title: string ): BeaTitleLengthBucket {
	const length = clean( title ).length;
	if ( length <= 52 ) {
		return 'compact';
	}
	if ( length <= 74 ) {
		return 'standard';
	}
	if ( length <= 90 ) {
		return 'long';
	}
	return 'editorial';
}

export function titleLengthBucketLabel( bucket: BeaTitleLengthBucket ): string {
	switch ( bucket ) {
		case 'compact':
			return 'compact';
		case 'standard':
			return 'standard';
		case 'long':
			return 'long';
		default:
			return 'editorial';
	}
}

function dedupeStrings( values: Array< string | undefined > ): string[] {
	const out: string[] = [];
	const seen = new Set< string >();
	for ( const value of values ) {
		const cleaned = clean( value ).replace( /\s+/g, ' ' ).trim();
		if ( ! cleaned ) {
			continue;
		}
		const key = cleaned.toLowerCase();
		if ( seen.has( key ) ) {
			continue;
		}
		seen.add( key );
		out.push( cleaned );
	}
	return out;
}

function stripTerminalPunctuation( value: string ): string {
	return value.replace( /[.]+$/g, '' ).trim();
}

function sentenceFragment( value: string ): string {
	return clean( value )
		.replace( /\s+/g, ' ' )
		.replace( /\s+[.?!]+$/g, '' )
		.trim();
}

function buildSignals( brief: CampaignBrief, imageCount: number ): BeaSignals {
	const sourceTitle = clean( brief.sourceTitle );
	return {
		imageCount,
		hasQuote: brief.quotes.some( ( quote ) => clean( quote.text ).length > 0 ),
		hasStat: brief.stats.some( ( stat ) => clean( stat.value ).length > 0 ),
		hasEyebrow: brief.eyebrowOptions.some( ( item ) => clean( item ).length > 0 ),
		hasCta: brief.ctas.some( ( item ) => clean( item ).length > 0 ),
		sourceTitleLength: sourceTitle.length,
		titleBucket: titleLengthBucket( sourceTitle ),
		goal: brief.campaignGoal,
		headlineCandidates: dedupeStrings( [
			brief.sourceTitle,
			...brief.headlines,
			brief.primaryAngle,
			...brief.alternateAngles,
		] ).map( stripTerminalPunctuation ),
		dekCandidates: dedupeStrings( [
			...brief.dekOptions,
			brief.sourceSummary,
			...brief.stats.map( ( stat ) => stat.context ),
			...brief.quotes.map( ( quote ) => quote.text ),
		] ),
		summaryLength: clean( brief.sourceSummary ).length,
	};
}

function distanceToWindow( length: number, [ min, max ]: [ number, number ] ): number {
	if ( length < min ) {
		return min - length;
	}
	if ( length > max ) {
		return length - max;
	}
	return 0;
}

function bestHeadlineWindowScore( candidates: string[], window: [ number, number ] ): number {
	if ( ! candidates.length ) {
		return 0;
	}
	let best = 0;
	for ( const candidate of candidates ) {
		const distance = distanceToWindow( candidate.length, window );
		const score = distance === 0 ? 18 : Math.max( 0, 18 - distance * 1.4 );
		if ( score > best ) {
			best = score;
		}
	}
	return best;
}

function requiredSlotMissing(
	family: BeaLayoutFamily,
	slot: 'quote' | 'statValue',
	signals: BeaSignals
): boolean {
	const spec = family.slots[ slot ];
	if ( ! spec?.required ) {
		return false;
	}
	if ( slot === 'quote' ) {
		return ! signals.hasQuote;
	}
	return ! signals.hasStat;
}

function densityTarget( signals: BeaSignals ): BeaLayoutFamily[ 'contentShape' ][ 'density' ] {
	if ( signals.summaryLength > 140 || signals.hasQuote ) {
		return 'high';
	}
	if ( signals.summaryLength > 90 || signals.hasStat ) {
		return 'medium';
	}
	return 'low';
}

function scoreFamily( family: BeaLayoutFamily, signals: BeaSignals ): FamilyScore | null {
	if ( family.id === 'blank' ) {
		return null;
	}
	if (
		[ 'story-feed-card-bleed', 'story-feed-card-bottom', 'story-feed-card-bottom-bleed' ].includes(
			family.id
		) &&
		signals.imageCount < 1
	) {
		return null;
	}
	const titleBuckets = family.contentShape.titleBuckets ?? [
		'compact',
		'standard',
		'long',
		'editorial',
	];
	if ( ! titleBuckets.includes( signals.titleBucket ) ) {
		return null;
	}
	if ( signals.sourceTitleLength > family.contentShape.headlineChars[ 1 ] ) {
		return null;
	}
	if ( ( family.artDirection?.minImages ?? 0 ) > signals.imageCount ) {
		return null;
	}
	if ( family.contentShape.requiresImage && signals.imageCount < 1 ) {
		return null;
	}
	if ( requiredSlotMissing( family, 'quote', signals ) ) {
		return null;
	}
	if ( requiredSlotMissing( family, 'statValue', signals ) ) {
		return null;
	}

	const reasons: string[] = [];
	let score = 32;
	const emphasis = family.artDirection?.emphasis;

	if (
		[
			'square-full-image-logo',
			'horizontal-full-image-logo',
			'story-full-image-logo',
			'horizontal-image-title',
			'horizontal-image-title-bleed',
			'horizontal-text-first-image',
			'horizontal-text-first-image-bleed',
			'horizontal-no-image',
			'horizontal-image-logo',
			'horizontal-image-logo-bleed',
		].includes( family.id )
	) {
		score += 36;
		reasons.push(
			family.id.startsWith( 'square-' )
				? 'locked square layout'
				: family.id.startsWith( 'story-' )
				? 'locked story layout'
				: 'locked horizontal layout'
		);
	}

	if (
		[
			'story-feed-card',
			'story-feed-card-bleed',
			'story-feed-card-bottom',
			'story-feed-card-bottom-bleed',
			'story-stat-hero',
		].includes( family.id )
	) {
		score += 40;
		reasons.push( 'locked story layout' );
	}

	if ( family.artDirection?.preferredGoals?.includes( signals.goal ) ) {
		score += 14;
		reasons.push( `${ goalToLabel( signals.goal ) } goal matches` );
	}

	const headlineFit = bestHeadlineWindowScore(
		signals.headlineCandidates,
		family.contentShape.headlineChars
	);
	score += headlineFit;
	if ( headlineFit >= 16 ) {
		reasons.push( 'headline length fits the composition' );
	}
	if ( family.contentShape.titleBuckets ) {
		reasons.push( `${ titleLengthBucketLabel( signals.titleBucket ) } source title supported` );
	}

	const targetDensity = densityTarget( signals );
	if ( family.contentShape.density === targetDensity ) {
		score += 8;
		reasons.push( `${ targetDensity } density suits the brief` );
	} else if ( family.contentShape.density === 'medium' && targetDensity !== 'low' ) {
		score += 4;
	}

	if ( emphasis === 'stat' && signals.hasStat ) {
		score += 24;
		reasons.push( 'proof point available' );
	}
	if ( emphasis === 'quote' && signals.hasQuote ) {
		score += 20;
		reasons.push( 'usable quote available' );
	}
	if ( ( emphasis === 'image' || emphasis === 'collage' ) && signals.imageCount > 0 ) {
		score += 18;
		reasons.push(
			`${ signals.imageCount } image${ signals.imageCount === 1 ? '' : 's' } can carry the layout`
		);
	}
	if ( emphasis === 'collage' && signals.imageCount > 1 ) {
		score += 8;
	}
	if ( emphasis === 'type' && signals.imageCount === 0 ) {
		score += 16;
		reasons.push( 'type has to do the work' );
	}

	if ( ! signals.hasEyebrow && family.slots.eyebrow ) {
		score -= 4;
	}
	if ( ! signals.hasCta && family.slots.cta ) {
		score -= 2;
	}

	return {
		family,
		score,
		rationale:
			reasons.slice( 0, 3 ).join( '; ' ) || family.artDirection?.thesis || family.description,
	};
}

function pickFamilies( brief: CampaignBrief, imageCount: number ): FamilyScore[] {
	const signals = buildSignals( brief, imageCount );
	const scored = BEA_LAYOUT_FAMILIES.map( ( family ) => scoreFamily( family, signals ) )
		.filter( ( item ): item is FamilyScore => Boolean( item ) )
		.sort( ( a, b ) => b.score - a.score );

	return scored;
}

type PickTextOptions = {
	min?: number;
	max: number;
	prefer?: 'short' | 'balanced' | 'long';
	stripPeriod?: boolean;
};

function pickText( candidates: Array< string | undefined >, options: PickTextOptions ): string {
	const cleaned = dedupeStrings( candidates )
		.map( ( value ) => ( options.stripPeriod ? stripTerminalPunctuation( value ) : value ) )
		.filter( Boolean );
	if ( ! cleaned.length ) {
		return '';
	}

	const min = options.min ?? 0;
	const center = min > 0 ? ( min + options.max ) / 2 : options.max * 0.62;
	let best = cleaned[ 0 ];
	let bestScore = Number.NEGATIVE_INFINITY;

	for ( const candidate of cleaned ) {
		const distance = distanceToWindow( candidate.length, [ min, options.max ] );
		let score = -distance * 8 - Math.abs( candidate.length - center ) * 0.4;
		if ( options.prefer === 'short' ) {
			score -= candidate.length * 0.12;
		}
		if ( options.prefer === 'long' ) {
			score += candidate.length * 0.12;
		}
		if ( distance === 0 ) {
			score += 14;
		}
		if ( score > bestScore ) {
			best = candidate;
			bestScore = score;
		}
	}

	return truncate( best, options.max );
}

function normalizeCompare( value: string ): string {
	return clean( value )
		.toLowerCase()
		.replace( /&/g, ' and ' )
		.replace( /[^a-z0-9$%.:]+/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();
}

function tokenSet( value: string ): Set< string > {
	return new Set(
		normalizeCompare( value )
			.split( ' ' )
			.filter( ( token ) => token.length > 2 )
	);
}

function isTooSimilar( a: string, b: string ): boolean {
	const na = normalizeCompare( a );
	const nb = normalizeCompare( b );
	if ( ! na || ! nb ) {
		return false;
	}
	if ( na === nb ) {
		return true;
	}
	if ( ( na.includes( nb ) || nb.includes( na ) ) && Math.min( na.length, nb.length ) >= 12 ) {
		return true;
	}
	const aTokens = tokenSet( a );
	const bTokens = tokenSet( b );
	if ( ! aTokens.size || ! bTokens.size ) {
		return false;
	}
	const smaller = aTokens.size <= bTokens.size ? aTokens : bTokens;
	const larger = aTokens.size <= bTokens.size ? bTokens : aTokens;
	let hits = 0;
	for ( const token of smaller ) {
		if ( larger.has( token ) ) {
			hits += 1;
		}
	}
	return hits / smaller.size >= 0.8;
}

function pickDistinctText(
	candidates: Array< string | undefined >,
	options: PickTextOptions,
	disallow: string[]
): string {
	const filtered = dedupeStrings( candidates ).filter(
		( candidate ) => ! disallow.some( ( used ) => isTooSimilar( candidate, used ) )
	);
	if ( filtered.length ) {
		return pickText( filtered, options );
	}
	return pickText( candidates, options );
}

function composeStatLabel( stat: CampaignBrief[ 'stats' ][ number ] | undefined ): string {
	if ( ! stat ) {
		return '';
	}
	return sentenceFragment( [ stat.label, stat.context ].filter( Boolean ).join( '. ' ) );
}

// The concise caption that sits under a big stat figure. It is the semantic
// label that says what the number measures, so "value + caption" reads as a
// complete claim. Falls back to the context sentence when no label survived.
function statCaption( stat: CampaignBrief[ 'stats' ][ number ] | undefined ): string {
	if ( ! stat ) {
		return '';
	}
	return sentenceFragment( stat.label || stat.context );
}

function usedImageSlots(
	blocks: NonNullable< BeaLayoutFamily[ 'sizes' ][ 'cover' ][ 'blocks' ] >
): string[] {
	const slots: string[] = [];
	for ( const block of blocks ) {
		if ( block.type === 'image' && block.slot ) {
			slots.push( block.slot );
		}
		if ( block.children?.length ) {
			slots.push( ...usedImageSlots( block.children ) );
		}
	}
	return slots;
}

function imageAssignmentsForFamily(
	family: BeaLayoutFamily,
	imageCount: number,
	startIndex = 0
): Record< string, number > | undefined {
	if ( imageCount < 1 ) {
		return undefined;
	}
	const slots = Array.from(
		new Set(
			Object.values( family.sizes ).flatMap( ( layout ) => usedImageSlots( layout.blocks ) )
		)
	);
	if ( ! slots.length ) {
		return undefined;
	}

	const assignments: Record< string, number > = {};
	slots.forEach( ( slot, idx ) => {
		assignments[ slot ] = ( startIndex + idx ) % imageCount;
	} );
	return assignments;
}

function themesForFamily( family: BeaLayoutFamily ): BeaTheme[] {
	const preferred = family.artDirection?.preferredThemes;
	if ( preferred?.length ) {
		return preferred.slice( 0, 3 );
	}
	return [ 'light', 'brand', 'soft' ];
}

function themeLabel( theme: BeaTheme ): string {
	switch ( theme ) {
		case 'brand':
			return 'Primary';
		case 'soft':
			return 'Secondary';
		case 'ink':
			return 'Dark';
		default:
			return 'Surface';
	}
}

function fillSlots(
	family: BeaLayoutFamily,
	brief: CampaignBrief,
	variantIdx: number,
	pack?: BrandPack
): Record< string, string > {
	const goalLabel = goalToLabel( brief.campaignGoal );
	const quote = brief.quotes[ variantIdx % Math.max( 1, brief.quotes.length ) ];
	const stat = brief.stats[ variantIdx % Math.max( 1, brief.stats.length ) ];
	const sourceHeadline = clean( brief.sourceTitle );
	const deks = dedupeStrings( [
		...brief.dekOptions,
		brief.sourceSummary,
		composeStatLabel( stat ),
		quote?.text,
		brief.primaryAngle,
	] );
	const eyebrows = dedupeStrings( [ ...brief.eyebrowOptions, goalLabel, pack?.name ] ).map(
		stripTerminalPunctuation
	);
	const ctas = dedupeStrings( [ ...brief.ctas ] ).map( stripTerminalPunctuation );

	const slots: Record< string, string > = {
		eyebrow: pickText( eyebrows, {
			max: family.slots.eyebrow?.maxChars ?? 24,
			prefer: 'short',
			stripPeriod: true,
		} ),
		headline: sourceHeadline,
		dek: '',
		cta: pickText( ctas, {
			max: family.slots.cta?.maxChars ?? 22,
			prefer: 'short',
			stripPeriod: true,
		} ),
		quote: '',
		quoteAttribution: truncate(
			clean( quote?.attribution ),
			family.slots.quoteAttribution?.maxChars ?? 56
		),
		statValue: truncate( clean( stat?.value ), family.slots.statValue?.maxChars ?? 14 ),
		statLabel: '',
		tlLabel: truncate( clean( pack?.name ) || goalLabel, 28 ),
		trLabel: truncate( goalLabel, 24 ),
		blLabel: truncate( clean( brief.audience ) || 'Campaign', 24 ),
		brLabel: truncate( clean( brief.ctas[ 0 ] ) || '', 24 ),
	};

	slots.dek = pickDistinctText(
		deks,
		{ max: family.slots.dek?.maxChars ?? 140, prefer: 'balanced' },
		[ slots.headline ]
	);
	slots.quote = pickDistinctText(
		brief.quotes.map( ( item ) => item.text ),
		{ max: family.slots.quote?.maxChars ?? 140, prefer: 'balanced' },
		[ slots.headline, slots.dek ]
	);
	slots.statLabel = pickDistinctText(
		[ statCaption( stat ), composeStatLabel( stat ), stat?.context, stat?.label ].filter( Boolean ),
		{ max: family.slots.statLabel?.maxChars ?? 90, prefer: 'balanced' },
		[ slots.headline, slots.dek, slots.quote ]
	);

	if ( family.id === 'type-led-brand' ) {
		slots.dek = pickDistinctText(
			deks,
			{ max: family.slots.dek?.maxChars ?? 140, prefer: 'short' },
			[ slots.headline ]
		);
	} else if ( family.id === 'simple-hero-image' || family.id === 'photo-band' ) {
		slots.dek = pickDistinctText(
			deks,
			{ max: family.slots.dek?.maxChars ?? 140, prefer: 'short' },
			[ slots.headline ]
		);
	} else if ( family.id === 'stat-hero' ) {
		slots.statLabel = pickDistinctText(
			[ statCaption( stat ), composeStatLabel( stat ), stat?.context, stat?.label ].filter(
				Boolean
			),
			{ max: family.slots.statLabel?.maxChars ?? 90, prefer: 'balanced' },
			[ slots.headline ]
		);
		slots.dek = pickDistinctText(
			[ brief.sourceSummary, ...brief.dekOptions, brief.primaryAngle ],
			{
				max: family.slots.dek?.maxChars ?? 140,
				prefer: 'balanced',
			},
			[ slots.headline, slots.statLabel ]
		);
	} else if ( family.id === 'story-stat-hero' ) {
		// Story format: a giant figure needs a concise label that names it.
		// Prefer the semantic label, never a stray dek or the source summary.
		slots.statLabel = pickDistinctText(
			[ statCaption( stat ), stat?.label, stat?.context ].filter( Boolean ),
			{ max: family.slots.statLabel?.maxChars ?? 60, prefer: 'balanced' },
			[ slots.headline ]
		);
	} else if ( family.id === 'quote-editorial' ) {
		slots.quote = pickDistinctText(
			brief.quotes.map( ( item ) => item.text ),
			{ max: family.slots.quote?.maxChars ?? 140, prefer: 'balanced' },
			[ slots.headline ]
		);
		slots.eyebrow = pickText( [ ...brief.eyebrowOptions, quote?.attribution, goalLabel ], {
			max: family.slots.eyebrow?.maxChars ?? 24,
			prefer: 'short',
			stripPeriod: true,
		} );
	} else if ( family.id === 'studio-card-stack' ) {
		slots.dek = pickDistinctText(
			deks,
			{ max: family.slots.dek?.maxChars ?? 140, prefer: 'long' },
			[ slots.headline ]
		);
	} else if ( family.id === 'poster-gallery' ) {
		slots.dek = pickDistinctText(
			[ ...brief.dekOptions, brief.sourceSummary, composeStatLabel( stat ) ],
			{
				max: family.slots.dek?.maxChars ?? 140,
				prefer: 'short',
			},
			[ slots.headline ]
		);
	}

	for ( const [ slot, spec ] of Object.entries( family.slots ) ) {
		if ( ! slots[ slot ] ) {
			continue;
		}
		slots[ slot ] = truncate( slots[ slot ], spec.maxChars );
	}

	if ( family.slots.quote?.required && ! slots.quote ) {
		slots.quote = truncate( clean( brief.primaryAngle ), family.slots.quote.maxChars );
	}
	if ( family.slots.statValue?.required && ! slots.statValue ) {
		slots.statValue = '01';
	}
	if ( family.slots.headline?.required && ! slots.headline ) {
		slots.headline = truncate( clean( brief.sourceTitle ), family.slots.headline.maxChars );
	}

	return slots;
}

function buildFixedDirections(
	brief: CampaignBrief,
	imageCount: number,
	pack?: BrandPack
): BeaDirection[] {
	const scoredFamilies = pickFamilies( brief, imageCount );
	const directions: BeaDirection[] = [];

	scoredFamilies.forEach( ( { family, rationale }, familyIdx ) => {
		themesForFamily( family ).forEach( ( theme ) => {
			const variantIdx = directions.length;
			directions.push( {
				variantLabel: `${ family.label } · ${ themeLabel( theme ) }`,
				layoutFamilyId: family.id,
				angle: brief.alternateAngles[ familyIdx ] ?? brief.primaryAngle,
				theme,
				slots: fillSlots( family, brief, variantIdx, pack ),
				imageAssignments: imageAssignmentsForFamily( family, imageCount, variantIdx ),
				rationale,
			} );
		} );
	} );

	return directions;
}

function goalToLabel( goal: CampaignGoal ): string {
	switch ( goal ) {
		case 'announce':
			return 'Announcement';
		case 'promote-offer':
			return 'Offer';
		case 'event':
			return 'Event';
		case 'case-study':
			return 'Case study';
		case 'sales-enable':
			return 'For sales';
		default:
			return 'Read';
	}
}

/**
 * Project a CampaignBrief into the deterministic set of directions
 * Iris would render. Synchronous; no LLM call. The wpcom backend
 * already persists the brief (see the `compose-social-campaign-v1`
 * recipe) so this function is the only step the deliverable view has
 * to run on the client side before composing tile HTML.
 */
export function generateBeaCampaign( args: {
	brief: CampaignBrief;
	pack: BrandPack;
	imageCount: number;
} ): BeaGenerationResult {
	const directions = buildFixedDirections( args.brief, args.imageCount, args.pack );
	return { brief: args.brief, directions };
}
