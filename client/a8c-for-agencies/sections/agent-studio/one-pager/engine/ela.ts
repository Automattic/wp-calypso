// Main one-pager generation orchestrator. Ports the prototype's ela.ts
// generation pipeline, adapted to use the LLMService instead of calling
// OpenAI directly. Owns:
//   1. Prompt assembly + LLM call.
//   2. Comment extraction + cover stripping.
//   3. Cover composition (every layout × theme).
//   4. Per-page substitution: fonts, colors, logo URL, image placeholders.
//   5. Sentence-case post-processing.
//   6. Page theme injection.
//
// The repair loop (coverage / additions check + LLM re-call) is wired into
// the React hook; this module owns single-shot generation.

import { BASE_CSS } from './base-css';
import { composeDualLogo } from './composite-logo';
import { composeCoverPage, COVER_LAYOUTS, FALLBACK_TRANSPARENT_PNG } from './cover-composer';
import { applySentenceCase } from './sentence-case';
import { SYSTEM_PROMPT } from './system-prompt';
import { applyPageTheme, luminance, pageThemeColors, pickThemeSequence } from './theme';
import type {
	BrandPack,
	DualLogoOrder,
	ElaCover,
	ElaImage,
	ElaPageTheme,
	ElaResult,
} from './types';
import type { LLMService } from '../services/types';

const ROLE_DEFAULTS = {
	display: { case: 'uppercase' as const, tracking: '-0.01em' },
	h1: { case: 'as-typed' as const, tracking: '-0.02em' },
	h2: { case: 'as-typed' as const, tracking: '-0.01em' },
	eyebrow: { case: 'uppercase' as const, tracking: '0.16em' },
};

function caseToTransform( c: string | undefined ): string {
	if ( c === 'uppercase' ) {
		return 'uppercase';
	}
	if ( c === 'lowercase' ) {
		return 'lowercase';
	}
	if ( c === 'title-case' ) {
		return 'capitalize';
	}
	return 'none';
}

function caseForRole( pack: BrandPack, role: string ): string | undefined {
	return pack.fonts.find( ( f ) => f.role === role )?.case;
}

function trackingForRole( pack: BrandPack, role: string ): string | undefined {
	const t = pack.fonts.find( ( f ) => f.role === role )?.tracking;
	return t && t.trim() !== '' ? t.trim() : undefined;
}

function hasRole( pack: BrandPack, role: string ): boolean {
	return pack.fonts.some( ( f ) => f.role === role );
}

function familyForRole( pack: BrandPack, role: string ): string | undefined {
	const font = pack.fonts.find( ( f ) => f.role === role );
	if ( ! font ) {
		return undefined;
	}
	return font.systemFamily || font.family;
}

interface FontVars {
	bodyFont: string;
	displayFont: string;
	h1Font: string;
	h2Font: string;
	eyebrowFont: string;
	displayCase: string;
	h1Case: string;
	h2Case: string;
	eyebrowCase: string;
	displayTracking: string;
	h1Tracking: string;
	h2Tracking: string;
	eyebrowTracking: string;
	h1IsSentenceCase: boolean;
	h2IsSentenceCase: boolean;
	displayIsSentenceCase: boolean;
}

function resolveFontVars( pack: BrandPack ): FontVars {
	const bodyFont =
		familyForRole( pack, 'body' ) ||
		"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
	const h1Font = familyForRole( pack, 'h1' ) || bodyFont;
	const h2Font = familyForRole( pack, 'h2' ) || h1Font;
	const eyebrowFont = familyForRole( pack, 'eyebrow' ) || bodyFont;
	const displayFont = familyForRole( pack, 'display' ) || h1Font;

	const h1CaseRaw = caseForRole( pack, 'h1' ) ?? ROLE_DEFAULTS.h1.case;
	const h2CaseRaw = caseForRole( pack, 'h2' ) ?? h1CaseRaw;
	const displayCaseRaw = hasRole( pack, 'display' )
		? caseForRole( pack, 'display' ) ?? h1CaseRaw
		: h1CaseRaw;
	const eyebrowCaseRaw = caseForRole( pack, 'eyebrow' ) ?? ROLE_DEFAULTS.eyebrow.case;

	return {
		bodyFont,
		displayFont,
		h1Font,
		h2Font,
		eyebrowFont,
		displayCase: caseToTransform( displayCaseRaw ),
		h1Case: caseToTransform( h1CaseRaw ),
		h2Case: caseToTransform( h2CaseRaw ),
		eyebrowCase: caseToTransform( eyebrowCaseRaw ),
		displayTracking:
			trackingForRole( pack, 'display' ) ??
			trackingForRole( pack, 'h1' ) ??
			ROLE_DEFAULTS.display.tracking,
		h1Tracking: trackingForRole( pack, 'h1' ) ?? ROLE_DEFAULTS.h1.tracking,
		h2Tracking: trackingForRole( pack, 'h2' ) ?? ROLE_DEFAULTS.h2.tracking,
		eyebrowTracking: trackingForRole( pack, 'eyebrow' ) ?? ROLE_DEFAULTS.eyebrow.tracking,
		h1IsSentenceCase: h1CaseRaw === 'sentence-case',
		h2IsSentenceCase: h2CaseRaw === 'sentence-case',
		displayIsSentenceCase: displayCaseRaw === 'sentence-case',
	};
}

function applySentenceCaseToHeadings( html: string, fontVars: FontVars ): string {
	const { h1IsSentenceCase, h2IsSentenceCase, displayIsSentenceCase } = fontVars;
	if ( ! h1IsSentenceCase && ! h2IsSentenceCase && ! displayIsSentenceCase ) {
		return html;
	}
	return html.replace(
		/(<section\b[^>]*\bclass\s*=\s*("|')[^"']*\b(b-headline|b-display)\b[^"']*\2[^>]*>)([^<]*)(<\/section>)/gi,
		( _match, open: string, _q: string, cls: string, content: string, close: string ) => {
			let useSentence: boolean;
			if ( /b-display/i.test( cls ) ) {
				useSentence = displayIsSentenceCase;
			} else {
				const isH1 = /\bdata-level\s*=\s*("|')\s*1\s*\1/.test( open );
				useSentence = isH1 ? h1IsSentenceCase : h2IsSentenceCase;
			}
			return open + ( useSentence ? applySentenceCase( content ) : content ) + close;
		}
	);
}

function ensureNonEmptyImgSrc( html: string, fallback: string ): string {
	return html.replace( /<img\b([^>]*)>/gi, ( full, attrs: string ) => {
		const srcMatch = attrs.match( /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i );
		const current = srcMatch
			? ( srcMatch[ 1 ] ?? srcMatch[ 2 ] ?? srcMatch[ 3 ] ?? '' ).trim()
			: '';
		if ( current ) {
			return full;
		}
		if ( srcMatch ) {
			const fixed = attrs.replace(
				/\bsrc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i,
				`src="${ fallback }"`
			);
			return `<img${ fixed }>`;
		}
		return `<img src="${ fallback }"${ attrs }>`;
	} );
}

function substitutePlaceholders(
	html: string,
	vars: {
		logoUrl: string;
		brandAccent: string;
		fontVars: FontVars;
		images: ElaImage[];
	}
): string {
	const logoUrl = vars.logoUrl?.trim() || FALLBACK_TRANSPARENT_PNG;
	let out = html
		.replaceAll( '{{LOGO_URL}}', logoUrl )
		.replaceAll( '{{BODY_FONT}}', vars.fontVars.bodyFont )
		.replaceAll( '{{DISPLAY_FONT}}', vars.fontVars.displayFont )
		.replaceAll( '{{H1_FONT}}', vars.fontVars.h1Font )
		.replaceAll( '{{H2_FONT}}', vars.fontVars.h2Font )
		.replaceAll( '{{EYEBROW_FONT}}', vars.fontVars.eyebrowFont )
		.replaceAll( '{{DISPLAY_CASE}}', vars.fontVars.displayCase )
		.replaceAll( '{{H1_CASE}}', vars.fontVars.h1Case )
		.replaceAll( '{{H2_CASE}}', vars.fontVars.h2Case )
		.replaceAll( '{{EYEBROW_CASE}}', vars.fontVars.eyebrowCase )
		.replaceAll( '{{DISPLAY_TRACKING}}', vars.fontVars.displayTracking )
		.replaceAll( '{{H1_TRACKING}}', vars.fontVars.h1Tracking )
		.replaceAll( '{{H2_TRACKING}}', vars.fontVars.h2Tracking )
		.replaceAll( '{{EYEBROW_TRACKING}}', vars.fontVars.eyebrowTracking )
		.replaceAll( '{{BRAND_ACCENT}}', vars.brandAccent );
	vars.images.forEach( ( img, i ) => {
		out = out.replaceAll( `{{IMAGE_${ i + 1 }_URL}}`, img.dataUrl );
	} );
	let genericImageIndex = 0;
	out = out.replace( /\{\{IMAGE_N_URL\}\}/g, () => {
		const image = vars.images[ genericImageIndex++ ];
		return image?.dataUrl ?? FALLBACK_TRANSPARENT_PNG;
	} );
	out = out.replace( /\{\{IMAGE_\d+_URL\}\}/g, FALLBACK_TRANSPARENT_PNG );
	return ensureNonEmptyImgSrc( out, FALLBACK_TRANSPARENT_PNG );
}

function findMatchingDivEnd( html: string, fromIndex: number ): number {
	const re = /<\/?div\b[^>]*>/gi;
	re.lastIndex = fromIndex;
	let depth = 1;
	let m: RegExpExecArray | null;
	while ( ( m = re.exec( html ) ) ) {
		if ( m[ 0 ].startsWith( '</' ) ) {
			depth--;
			if ( depth === 0 ) {
				return m.index + m[ 0 ].length;
			}
		} else {
			depth++;
		}
	}
	return -1;
}

function injectBaseCss( pageHtml: string ): string {
	const wrapperMatch = pageHtml.match(
		/<div\b[^>]*class\s*=\s*["'][^"']*\bela-page\b[^"']*["'][^>]*>/i
	);
	if ( ! wrapperMatch ) {
		return pageHtml;
	}
	const styleAt = wrapperMatch.index! + wrapperMatch[ 0 ].length;
	return pageHtml.slice( 0, styleAt ) + `<style>${ BASE_CSS }</style>` + pageHtml.slice( styleAt );
}

function transformInlineLinks( pageHtml: string ): string {
	const LINK_BLOCK_RE =
		/<(section|aside|figure|blockquote|p|span)\b([^>]*\bclass\s*=\s*["'][^"']*\b(?:b-section|b-small|b-headline|b-display|b-quote|b-eyebrow)\b[^"']*["'][^>]*)>([\s\S]*?)<\/\1>/gi;
	const MARKDOWN_LINK_RE = /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|tel:|\/)[^\s)]+)\)/g;
	return pageHtml.replace( LINK_BLOCK_RE, ( full, tag: string, attrs: string, inner: string ) => {
		if ( ! MARKDOWN_LINK_RE.test( inner ) ) {
			return full;
		}
		MARKDOWN_LINK_RE.lastIndex = 0;
		const next = inner.replace( MARKDOWN_LINK_RE, ( _m, label: string, url: string ) => {
			const safeUrl = url.replace( /"/g, '&quot;' );
			return `<a href="${ safeUrl }" target="_blank" rel="noopener noreferrer">${ label }</a>`;
		} );
		return `<${ tag }${ attrs }>${ next }</${ tag }>`;
	} );
}

function extractPagesAndNotes( raw: string ): { pages: string[]; notes: string } {
	const fenced = raw.match( /```(?:html)?\s*([\s\S]*?)```/ );
	const body = fenced ? fenced[ 1 ] : raw;
	const noteMatch = body.match( /<!--\s*ELA_NOTES\s*([\s\S]*?)-->/i );
	const notes = noteMatch ? noteMatch[ 1 ].trim() : '';
	const stripped = body.replace( /<!--[\s\S]*?-->/g, '' );

	const pages: string[] = [];
	const openRe = /<div\b[^>]*class\s*=\s*["'][^"']*\bela-page\b[^"']*["'][^>]*>/gi;
	let openMatch: RegExpExecArray | null;
	while ( ( openMatch = openRe.exec( stripped ) ) ) {
		const start = openMatch.index;
		const end = findMatchingDivEnd( stripped, openMatch.index + openMatch[ 0 ].length );
		if ( end > start ) {
			pages.push( injectBaseCss( stripped.slice( start, end ).trim() ) );
			openRe.lastIndex = end;
		} else {
			break;
		}
	}

	if ( pages.length === 0 ) {
		const trimmed = stripped.trim();
		if ( trimmed ) {
			pages.push( injectBaseCss( trimmed ) );
		}
	}

	return { pages, notes };
}

// Quick recipe hint per body-image count, mirroring the SYSTEM_PROMPT's
// "4 images → U or E+E or D+D+E" guidance so the LLM has a concrete plan
// when it sees N images in the user message.
function recipeForImageCount( n: number ): string {
	switch ( n ) {
		case 1:
			return 'one D (or G as a quiet plate page)';
		case 2:
			return 'one E (side-by-side), or D + D';
		case 3:
			return 'D + D + D, or D + E';
		case 4:
			return 'one U (2×2 grid, when the four belong together), or E + E, or D + D + E';
		case 5:
			return 'U + D, or E + D + D, or E + E + D';
		case 6:
			return 'U + E, or E + E + E, or D + D + D + D + D + D';
		default:
			return `${ Math.ceil( n / 2 ) } pages of E plus ${ n % 2 === 1 ? '1 page of D' : 'mirrors' }`;
	}
}

export async function generateOnePager( args: {
	llm: LLMService;
	pack: BrandPack;
	inputText: string;
	title: string;
	blurb?: string;
	images?: ElaImage[];
	/** Override the brand pack's light-page logo with an uploaded one. */
	primaryLogoLightDataUrl?: string;
	/** Override the brand pack's dark-page logo with an uploaded one. */
	primaryLogoDarkDataUrl?: string;
	/** Optional partner logo (light-page variant). Triggers dual-logo composition. */
	partnerLogoLightDataUrl?: string;
	/** Optional partner logo (dark-page variant). Falls back to the light variant. */
	partnerLogoDarkDataUrl?: string;
	/** Which logo sits on the leading edge of the dual-logo separator. */
	partnerLogoOrder?: DualLogoOrder;
	model?: string;
	signal?: AbortSignal;
} ): Promise< ElaResult > {
	const fontVars = resolveFontVars( args.pack );
	const tokens = args.pack.tokens;
	const tokenList = Object.entries( tokens )
		.map( ( [ k, v ] ) => `- ${ k }: ${ v }` )
		.join( '\n' );

	const images = args.images ?? [];
	const bodyImages = images.slice( 1 );
	const imageList =
		bodyImages.length > 0
			? `\nUSER-PROVIDED IMAGES (use ALL ${ bodyImages.length } of these in the body pages — see the SYSTEM IMAGES rules; never drop one, never cram one into a small grid-row, give each a full-size image slot):\n` +
			  bodyImages
					.map( ( img, i ) => `- {{IMAGE_${ i + 1 }_URL}} (file: "${ img.fileName }")` )
					.join( '\n' ) +
			  `\n\nIMAGE-PATTERN BUDGET: with ${ bodyImages.length } body image${
					bodyImages.length === 1 ? '' : 's'
			  }, plan enough image-pattern capacity for all of them (D, E, F, G, N, U or their -R mirrors) — for example: ${ recipeForImageCount(
					bodyImages.length
			  ) }. Pick image patterns over their bare-text equivalents on every page that can carry a photo.`
			: '\nNO IMAGES PROVIDED: do NOT use {{IMAGE_N_URL}} placeholders.';

	const userMessage = [
		`Brand name: ${ args.pack.name }`,
		`Brand color tokens (hex):\n${ tokenList }`,
		imageList,
		`\nContent for the document (this is the ONLY source of renderable copy — do not invent, paraphrase, or add brand context, taglines, or descriptive prose):\n${ args.inputText }`,
		'\nBegin with the <!-- ELA_NOTES ... --> comment, then output one or more <div class="ela-page"> blocks.',
	].join( '\n' );

	const llmResponse = await args.llm.chat( {
		model: args.model || 'gpt-5.4-mini',
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: userMessage },
		],
		signal: args.signal,
	} );

	const { pages: rawBodyPages, notes } = extractPagesAndNotes( llmResponse.content );
	const brandAccent = tokens.brandPrimary;

	const themeSequence = pickThemeSequence( 1 + rawBodyPages.length );
	const themeForPage = ( i: number ): ElaPageTheme => themeSequence[ i ] ?? 'light';
	const themeBgFor = ( theme: ElaPageTheme ): string =>
		pageThemeColors( theme, tokens )?.bg ?? '#FFFFFF';
	const isDarkTheme = ( theme: ElaPageTheme ): boolean => luminance( themeBgFor( theme ) ) < 0.5;
	// Primary logo: form upload overrides the pack's built-in. Falls back to
	// the pack's URL when no upload was provided (most v1 callers use the
	// neutral pack which has no logo, so the form upload is the only source).
	const primaryLight = args.primaryLogoLightDataUrl?.trim() || args.pack.logoLightUrl || '';
	const primaryDark = args.primaryLogoDarkDataUrl?.trim() || args.pack.logoDarkUrl || primaryLight;
	const baseLogoFor = ( theme: ElaPageTheme ): string =>
		isDarkTheme( theme ) ? primaryDark || primaryLight : primaryLight;
	// Partner-logo composite: when the user supplies a second logo, draw
	// "[primary] | [partner]" into a single PNG/SVG per theme so every
	// existing {{LOGO_URL}} site keeps working unchanged. Skipped silently
	// if the canvas draw fails — fall back to primary alone.
	const partnerLight = args.partnerLogoLightDataUrl?.trim();
	const partnerDark = args.partnerLogoDarkDataUrl?.trim();
	const partnerFor = ( theme: ElaPageTheme ): string | undefined =>
		isDarkTheme( theme ) ? partnerDark || partnerLight : partnerLight;
	const composedLogos = new Map< ElaPageTheme, string >();
	for ( const theme of [ 'light', 'ink', 'brand', 'accent' ] as ElaPageTheme[] ) {
		const base = baseLogoFor( theme );
		const partner = partnerFor( theme );
		if ( partner && base ) {
			try {
				composedLogos.set(
					theme,
					await composeDualLogo( base, partner, theme, args.partnerLogoOrder ?? 'brand-first' )
				);
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.warn( '[one-pager] dual-logo composite failed, using primary alone:', err );
				composedLogos.set( theme, base );
			}
		} else {
			composedLogos.set( theme, base );
		}
	}
	const logoUrlFor = ( theme: ElaPageTheme ): string => composedLogos.get( theme ) ?? '';

	const coverImageUrl = images[ 0 ]?.dataUrl ?? FALLBACK_TRANSPARENT_PNG;

	const darkCoverTheme = ( [ 'brand', 'ink', 'accent' ] as ElaPageTheme[] ).find( ( theme ) => {
		const colors = pageThemeColors( theme, tokens );
		return colors ? luminance( colors.bg ) < 0.5 : false;
	} );
	const COVER_THEMES: ElaPageTheme[] = darkCoverTheme ? [ 'light', darkCoverTheme ] : [ 'light' ];

	const covers: ElaCover[] = [];
	for ( const layout of COVER_LAYOUTS ) {
		for ( const theme of COVER_THEMES ) {
			const composed = composeCoverPage( {
				title: args.title,
				blurb: args.blurb ?? '',
				imageUrl: coverImageUrl,
				logoUrl: logoUrlFor( theme ) || FALLBACK_TRANSPARENT_PNG,
				layout,
			} );
			const html = applyPageTheme(
				applySentenceCaseToHeadings(
					substitutePlaceholders( injectBaseCss( composed ), {
						logoUrl: logoUrlFor( theme ),
						brandAccent,
						fontVars,
						images,
					} ),
					fontVars
				),
				theme,
				pageThemeColors( theme, tokens )
			);
			covers.push( {
				id: `${ layout.id }__${ theme }`,
				layoutId: layout.id,
				theme,
				html,
			} );
		}
	}

	const bodyPages = rawBodyPages.map( ( page, i ) => {
		const theme = themeForPage( i + 1 );
		const substituted = substitutePlaceholders( page, {
			logoUrl: logoUrlFor( theme ),
			brandAccent,
			fontVars,
			images: bodyImages,
		} );
		const sentenced = applySentenceCaseToHeadings( substituted, fontVars );
		const linked = transformInlineLinks( sentenced );
		return applyPageTheme( linked, theme, pageThemeColors( theme, tokens ) );
	} );

	return {
		covers,
		bodyPages,
		notes,
		usage: {
			inputTokens: llmResponse.inputTokens,
			outputTokens: llmResponse.outputTokens,
			usd: llmResponse.usd ?? 0,
			model: llmResponse.model,
			durationMs: llmResponse.durationMs,
		},
	};
}

const TITLE_BLURB_PROMPT = `You write covers for short business documents. Given the user's brief, return a single JSON object with two strings:
- "title": a confident, specific headline. Max 65 characters. No clickbait. No generic phrases. Should be a real claim, insight, or sharp question. Do not end it with a period.
- "blurb": one or two sentences (max 200 characters) that frame the document beneath the title.

Both must be under their character limits. Output ONLY the JSON object — no prose, no markdown fences, no explanation.`;

export async function suggestTitleAndBlurb( args: {
	llm: LLMService;
	inputText: string;
	field: 'title' | 'blurb';
	model?: string;
	signal?: AbortSignal;
} ): Promise< string > {
	const response = await args.llm.chat( {
		model: args.model || 'gpt-5.4-mini',
		messages: [
			{ role: 'system', content: TITLE_BLURB_PROMPT },
			{ role: 'user', content: `Brief:\n${ args.inputText }` },
		],
		responseFormat: 'json_object',
		signal: args.signal,
	} );
	let parsed: { title?: unknown; blurb?: unknown };
	try {
		parsed = JSON.parse( response.content );
	} catch {
		throw new Error( 'Suggest returned non-JSON' );
	}
	if ( args.field === 'title' ) {
		const title = typeof parsed.title === 'string' ? parsed.title.trim().slice( 0, 65 ) : '';
		return title;
	}
	const blurb = typeof parsed.blurb === 'string' ? parsed.blurb.trim().slice( 0, 200 ) : '';
	return blurb;
}
