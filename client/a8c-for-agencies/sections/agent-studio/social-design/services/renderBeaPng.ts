/* eslint-disable no-nested-ternary */
import { pickLogo } from '../templates/pickLogo';
import {
	BEA_DEFAULT_GAP,
	BEA_GRID,
	BEA_SIZES,
	type BeaBlockSpec,
	type BeaLayoutFamily,
	type BeaSizeKey,
	type BeaTheme,
} from './beaLayouts';
import { applySentenceCase } from './sentenceCase';
import type { BrandPack } from '../brandPacks/types';
import type { OutputSize } from '../types';

export type BeaRenderInput = {
	family: BeaLayoutFamily;
	sizeKey: BeaSizeKey;
	theme: BeaTheme;
	slots: Record< string, string >;
	imageAssignments?: Record< string, number >;
	images?: Array< { fileName: string; dataUrl: string } >;
	pack: BrandPack;
	fontFamily?: string;
	displayFontFamily?: string;
};

type ThemeColors = {
	bg: string;
	fg: string;
	muted: string;
	accent: string;
	soft: string;
	brand: string;
	ink: string;
};

function hexToRgb( hex: string ): { r: number; g: number; b: number } | undefined {
	const value = hex.trim().replace( /^#/, '' );
	if ( ! /^[0-9a-f]{6}$/i.test( value ) ) {
		return undefined;
	}
	return {
		r: Number.parseInt( value.slice( 0, 2 ), 16 ),
		g: Number.parseInt( value.slice( 2, 4 ), 16 ),
		b: Number.parseInt( value.slice( 4, 6 ), 16 ),
	};
}

function relativeLuminance( hex: string ): number {
	const rgb = hexToRgb( hex );
	if ( ! rgb ) {
		return 1;
	}
	const linear = [ rgb.r, rgb.g, rgb.b ].map( ( channel ) => {
		const value = channel / 255;
		return value <= 0.03928 ? value / 12.92 : ( ( value + 0.055 ) / 1.055 ) ** 2.4;
	} );
	return linear[ 0 ] * 0.2126 + linear[ 1 ] * 0.7152 + linear[ 2 ] * 0.0722;
}

function readableText( bg: string, pack: BrandPack ): string {
	return relativeLuminance( bg ) > 0.48 ? pack.tokens.textPrimary : pack.tokens.surfacePrimary;
}

function withAlpha( color: string, alpha: string ): string {
	return /^#[0-9a-f]{6}$/i.test( color ) ? `${ color }${ alpha }` : color;
}

function colorTheme( bg: string, pack: BrandPack, accent?: string ): ThemeColors {
	const fg = readableText( bg, pack );
	return {
		bg,
		fg,
		muted: withAlpha( fg, 'CC' ),
		accent: accent ?? fg,
		soft: withAlpha( fg, '1F' ),
		brand: pack.tokens.brandPrimary,
		ink: pack.tokens.surfaceBrand,
	};
}

function themeColors( pack: BrandPack, theme: BeaTheme ): ThemeColors {
	const t = pack.tokens;
	if ( theme === 'brand' ) {
		return colorTheme( t.brandPrimary, pack );
	}
	if ( theme === 'ink' ) {
		return colorTheme( t.surfaceBrand, pack, t.brandPrimary );
	}
	if ( theme === 'soft' ) {
		return colorTheme( t.brandSecondary, pack );
	}
	return {
		bg: t.surfacePrimary,
		fg: t.textPrimary,
		muted: t.textSecondary,
		accent: t.brandPrimary,
		soft: t.surfaceSecondary,
		brand: t.brandPrimary,
		ink: t.surfaceBrand,
	};
}

function esc( value: string | undefined ): string {
	return ( value ?? '' )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}

function attr( value: string | undefined ): string {
	return esc( value ).replace( /'/g, '&#39;' );
}

function scopeCss( css: string, scopeClass: string ): string {
	const scope = `.${ scopeClass }`;
	return css.replace(
		/(^|\n)(\s*)(\.bea[^{]+)\{/g,
		( _match, start: string, indent: string, selectorText: string ) => {
			const selectors = selectorText
				.split( ',' )
				.map( ( selector ) => `${ scope } ${ selector.trim() }` )
				.join( ', ' );
			return `${ start }${ indent }${ selectors } {`;
		}
	);
}

function blockStyle( block: BeaBlockSpec, margin: number ): string {
	const canBleed = block.type === 'container' || block.type === 'image';
	const bleed = canBleed ? block.bleed : undefined;
	const bleedX = ( bleed?.l ? margin : 0 ) + ( bleed?.r ? margin : 0 );
	const bleedY = ( bleed?.t ? margin : 0 ) + ( bleed?.b ? margin : 0 );
	return [
		`grid-column:${ block.col } / span ${ block.colSpan }`,
		`grid-row:${ block.row } / span ${ block.rowSpan }`,
		block.zIndex !== undefined ? `z-index:${ block.zIndex }` : '',
		block.align ? `align-self:${ block.align }` : '',
		block.justify ? `justify-self:${ block.justify }` : '',
		bleed?.t ? `margin-top:-${ margin }px` : '',
		bleed?.r ? `margin-right:-${ margin }px` : '',
		bleed?.b ? `margin-bottom:-${ margin }px` : '',
		bleed?.l ? `margin-left:-${ margin }px` : '',
		bleedX ? `width:calc(100% + ${ bleedX }px)` : '',
		bleedY ? `height:calc(100% + ${ bleedY }px)` : '',
		block.radius !== undefined ? `border-radius:${ block.radius }px` : '',
		block.radius !== undefined ? 'overflow:hidden' : '',
	]
		.filter( Boolean )
		.join( ';' );
}

function imageFor( input: BeaRenderInput, slot: string | undefined ): string | undefined {
	if ( ! slot ) {
		return undefined;
	}
	const idx = input.imageAssignments?.[ slot ] ?? 0;
	return input.images?.[ idx ]?.dataUrl ?? input.images?.[ 0 ]?.dataUrl;
}

function fillClass( block: BeaBlockSpec ): string {
	return block.fill ? ` bea-block--fill-${ block.fill }` : '';
}

function fillColor( block: BeaBlockSpec, colors: ThemeColors ): string | undefined {
	if ( block.fill === 'brand' ) {
		return colors.brand;
	}
	if ( block.fill === 'ink' ) {
		return colors.ink;
	}
	if ( block.fill === 'soft' ) {
		return colors.soft;
	}
	if ( block.fill === 'accent' ) {
		return colors.accent;
	}
	return undefined;
}

function nestedStyle( block: BeaBlockSpec ): string {
	const align = block.align ?? 'start';
	const justify = block.justify ?? 'start';
	return [
		`align-self:${ align === 'start' ? 'stretch' : align }`,
		`justify-content:${
			justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : 'center'
		}`,
	].join( ';' );
}

function contentJustifyToCss( value: NonNullable< BeaBlockSpec[ 'contentJustify' ] > ) {
	if ( value === 'end' ) {
		return 'flex-end';
	}
	if ( value === 'space-between' ) {
		return 'space-between';
	}
	return value;
}

function contentAlignToCss( value: NonNullable< BeaBlockSpec[ 'contentAlign' ] > ) {
	if ( value === 'end' ) {
		return 'flex-end';
	}
	return value;
}

// Resolve a brand's case rule for Bea headlines from the per-role `case`
// the brand pack declares -- the same fields Ela reads, so the two renderers
// stay on one brand kit. CSS owns uppercase; sentence-case is baked into the
// text in JS, because CSS text-transform cannot produce sentence case.
function beaHeadlineCase(
	pack: BrandPack,
	useDisplay: boolean
): { isUppercase: boolean; isSentenceCase: boolean } {
	const displayDef = pack.fonts.find( ( fontDef ) => fontDef.role === 'display' );
	const h1Case = pack.fonts.find( ( fontDef ) => fontDef.role === 'h1' )?.case;
	const headlineUpper = h1Case === 'uppercase' || pack.typography.headlineCase === 'uppercase';
	const headlineSentence = h1Case === 'sentence-case';
	if ( useDisplay ) {
		// Display falls back to the headline rule on brands with no display face.
		if ( ! displayDef ) {
			return { isUppercase: headlineUpper, isSentenceCase: headlineSentence };
		}
		return {
			isUppercase: displayDef.case === 'uppercase',
			isSentenceCase: displayDef.case === 'sentence-case',
		};
	}
	return { isUppercase: headlineUpper, isSentenceCase: headlineSentence };
}

function renderBlock(
	input: BeaRenderInput,
	block: BeaBlockSpec,
	colors: ThemeColors,
	margin: number,
	root = true,
	localBg = colors.bg
): string {
	const baseClass = root ? 'bea-block' : 'bea-nested';
	const style = root ? blockStyle( block, margin ) : nestedStyle( block );
	const value = block.slot ? input.slots[ block.slot ] : '';

	if ( block.type === 'container' ) {
		const direction = block.direction ?? 'v';
		const contentAlign = block.contentAlign ?? 'stretch';
		const nextBg = fillColor( block, colors ) ?? localBg;
		const children = ( block.children ?? [] )
			.map( ( child ) => renderBlock( input, child, colors, margin, false, nextBg ) )
			.join( '\n' );
		const containerStyle = [
			style,
			`padding:${ block.padding ?? 0 }px`,
			`gap:${ block.gap ?? 0 }px`,
			`justify-content:${ contentJustifyToCss( block.contentJustify ?? 'start' ) }`,
			`align-items:${ contentAlignToCss( contentAlign ) }`,
		].join( ';' );
		return `<div class="${ baseClass } bea-container bea-container--${ direction } bea-container--align-${ contentAlign }${ fillClass(
			block
		) }" style="${ containerStyle }">${ children }</div>`;
	}
	if ( block.type === 'shape' ) {
		return `<div class="${ baseClass } bea-shape${ fillClass( block ) }" style="${ style }"></div>`;
	}
	if ( block.type === 'rule' ) {
		return `<div class="${ baseClass } bea-rule" style="${ style }"></div>`;
	}
	if ( block.type === 'logo' ) {
		const logo = pickLogo(
			block.overlay ? '#000000' : localBg,
			input.pack.logoLightUrl,
			input.pack.logoDarkUrl
		);
		const overlay = block.overlay ? ' bea-logo--overlay' : '';
		return `<figure class="${ baseClass } bea-logo${ overlay }" data-logo-light="${ attr(
			input.pack.logoLightUrl
		) }" data-logo-dark="${ attr( input.pack.logoDarkUrl ) }" style="${ style }"><img src="${ attr(
			logo
		) }" alt="" /></figure>`;
	}
	if ( block.type === 'image' ) {
		const src = imageFor( input, block.slot );
		if ( ! src ) {
			return '';
		}
		return `<figure class="${ baseClass } bea-image" style="${ style }"><img src="${ attr(
			src
		) }" alt="" /></figure>`;
	}
	if ( block.type === 'headline' ) {
		const align = block.align ?? 'end';
		const justify = block.justify ?? 'start';
		const items = align === 'start' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end';
		const justifyCss =
			justify === 'end' ? 'flex-end' : justify === 'center' ? 'center' : 'flex-start';
		const textAlign = justify === 'center' ? 'center' : justify === 'end' ? 'right' : 'left';
		const variant = block.useDisplay ? ' bea-headline--display' : '';
		const overlay = block.overlay ? ' bea-headline--overlay' : '';
		const extra = `justify-self:stretch;align-items:${ items };justify-content:${ justifyCss };text-align:${ textAlign }`;
		// Apply the brand's headline case rule. Uppercase is handled by CSS
		// text-transform; sentence-case is baked in here.
		const caseRule = beaHeadlineCase( input.pack, Boolean( block.useDisplay ) );
		const headlineText = caseRule.isSentenceCase ? applySentenceCase( value ) : value;
		return `<h1 class="${ baseClass } bea-headline${ variant }${ overlay }" style="${ style };${ extra }"><span class="bea-headline__text">${ esc(
			headlineText
		) }</span></h1>`;
	}
	if ( block.type === 'eyebrow' ) {
		if ( ! value.trim() ) {
			return '';
		}
		return `<div class="${ baseClass } bea-eyebrow" style="${ style }">${ esc( value ) }</div>`;
	}
	if ( block.type === 'label' ) {
		if ( ! value.trim() ) {
			return '';
		}
		return `<div class="${ baseClass } bea-label" style="${ style }">${ esc( value ) }</div>`;
	}
	if ( block.type === 'dek' ) {
		if ( ! value.trim() ) {
			return '';
		}
		const overlay = block.overlay ? ' bea-dek--overlay' : '';
		return `<p class="${ baseClass } bea-dek${ overlay }" style="${ style }">${ esc( value ) }</p>`;
	}
	if ( block.type === 'cta' ) {
		if ( ! value.trim() ) {
			return '';
		}
		const justify = block.justify ?? 'start';
		const justifyCss =
			justify === 'end' ? 'flex-end' : justify === 'center' ? 'center' : 'flex-start';
		const align = block.align ?? 'end';
		const itemsCss = align === 'start' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end';
		const extra = `justify-self:stretch;align-self:stretch;justify-content:${ justifyCss };align-items:${ itemsCss }`;
		return `<div class="${ baseClass } bea-cta" style="${ style };${ extra }"><span class="bea-cta__label">${ esc(
			value
		) }</span><span class="bea-cta__arrow" aria-hidden="true">→</span></div>`;
	}
	if ( block.type === 'stat' ) {
		const variant = block.useDisplay ? ' bea-stat--display' : '';
		const label = block.useDisplay
			? input.slots.statLabel ?? ''
			: input.slots.statLabel || input.slots.dek || '';
		return `<div class="${ baseClass } bea-stat${ variant }" style="${ style }"><strong>${ esc(
			value
		) }</strong>${ label.trim() ? `<span>${ esc( label ) }</span>` : '' }</div>`;
	}
	if ( block.type === 'quote' ) {
		const attribution = input.slots.quoteAttribution;
		return `<figure class="${ baseClass } bea-quote" style="${ style }"><blockquote>${ esc(
			value
		) }</blockquote>${
			attribution ? `<figcaption>${ esc( attribution ) }</figcaption>` : ''
		}</figure>`;
	}
	return '';
}

export function composeBeaHtml( input: BeaRenderInput ): { html: string; size: OutputSize } {
	const size = BEA_SIZES[ input.sizeKey ];
	const layout = input.family.sizes[ input.sizeKey ];
	const colors = themeColors( input.pack, input.theme );
	const renderClass = `bea-render-${ input.family.id }-${ input.sizeKey }-${ input.theme }`.replace(
		/[^a-z0-9_-]/gi,
		'-'
	);
	const short = Math.min( size.width, size.height );
	const margin = Math.round( short * 0.065 );
	const gap = layout.gap ?? BEA_DEFAULT_GAP;
	const font =
		input.fontFamily ??
		'"Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
	const headlineFont =
		input.fontFamily ?? '"SF Pro Display", "Inter", "Helvetica Neue", Arial, sans-serif';
	const displayFontDef = input.pack.fonts.find( ( fontDef ) => fontDef.role === 'display' );
	const hasDisplayFont = Boolean( displayFontDef );
	const displayFont = hasDisplayFont ? input.displayFontFamily ?? headlineFont : headlineFont;
	// CSS only handles uppercase; sentence-case is baked into the headline text
	// in renderBlock. So these resolve to 'uppercase' or 'none'.
	const headlineCase = beaHeadlineCase( input.pack, false ).isUppercase ? 'uppercase' : 'none';
	const displayCase = beaHeadlineCase( input.pack, true ).isUppercase ? 'uppercase' : 'none';
	const displayMin = hasDisplayFont ? 0.08 : 0.052;
	const displayPreferred = hasDisplayFont ? 0.18 : 0.108;
	const displayMax = hasDisplayFont ? 0.28 : 0.16;
	const displayLineHeight = hasDisplayFont
		? 0.92
		: Math.max( 1.16, input.pack.typography.headlineLineHeight );
	const displayTracking = hasDisplayFont ? '-0.01em' : input.pack.typography.headlineTracking;
	const displayWeight = hasDisplayFont ? 900 : input.pack.typography.headlineWeight;
	const displayDescenderPad = hasDisplayFont ? 0 : 0.14;
	const hasImage = layout.blocks.some(
		( block ) => block.type === 'image' && imageFor( input, block.slot )
	);

	const ruleWeight = Math.max( 1, Math.round( short * 0.0018 ) );
	const eyebrowRule = Math.max( 12, Math.round( short * 0.028 ) );
	const ctaArrow = Math.max( 8, Math.round( short * 0.018 ) );

	const css = `
    .bea-canvas {
      width: ${ size.width }px;
      height: ${ size.height }px;
      box-sizing: border-box;
      padding: ${ margin }px;
      background: ${ colors.bg };
      color: ${ colors.fg };
      display: grid;
      grid-template-columns: repeat(${ BEA_GRID.cols }, minmax(0, 1fr));
      grid-template-rows: repeat(${ BEA_GRID.rows }, minmax(0, 1fr));
      gap: ${ gap }px;
      overflow: hidden;
      position: relative;
      font-family: ${ font };
    }
    .bea-block,
    .bea-nested { min-width: 0; min-height: 0; position: relative; z-index: 1; box-sizing: border-box; }
    .bea-nested { display: flex; }
    .bea-shape { z-index: 0; }
    .bea-block--fill-brand { background: ${ colors.brand }; }
    .bea-block--fill-ink { background: ${ colors.ink }; }
    .bea-block--fill-soft { background: ${ colors.soft }; }
    .bea-block--fill-accent { background: ${ colors.accent }; }
    .bea-logo { margin: 0; display: flex; align-items: center; min-height: 0; }
    .bea-logo img { width: auto; max-width: 100%; height: ${ Math.round(
			short * 0.07
		) }px; object-fit: contain; object-position: left center; }
    .bea-logo--overlay {
      isolation: isolate;
      overflow: visible;
      --bea-logo-scrim-rgb: 0, 0, 0;
      --bea-logo-scrim-alpha-strong: 0.46;
      --bea-logo-scrim-alpha-mid: 0.24;
      --bea-logo-shadow: rgba(0, 0, 0, 0.35);
    }
    .bea-logo--overlay::before {
      content: '';
      position: absolute;
      left: -${ margin }px;
      bottom: -${ margin }px;
      width: ${ Math.round( short * 0.48 ) }px;
      height: ${ Math.round( short * 0.22 ) }px;
      background: linear-gradient(
        32deg,
        rgba(var(--bea-logo-scrim-rgb), var(--bea-logo-scrim-alpha-strong)) 0%,
        rgba(var(--bea-logo-scrim-rgb), var(--bea-logo-scrim-alpha-mid)) 42%,
        rgba(0, 0, 0, 0) 78%
      );
      z-index: 0;
      pointer-events: none;
    }
    .bea-logo--overlay img {
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 ${ Math.max( 1, Math.round( short * 0.003 ) ) }px ${ Math.round(
				short * 0.012
			) }px var(--bea-logo-shadow));
    }
    .bea-image { margin: 0; overflow: hidden; background: ${ colors.soft }; }
    .bea-canvas[data-family="story-feed-card"] > .bea-image {
      align-self: start;
      height: calc(100% - ${ Math.round( margin * 0.5 ) }px) !important;
    }
    .bea-canvas[data-family="story-feed-card-bleed"] > .bea-image {
      align-self: start;
      height: calc(100% + ${ margin }px - ${ Math.round( margin * 0.5 ) }px) !important;
    }
    .bea-canvas[data-family="story-feed-card-bottom"] > .bea-image {
      align-self: end;
      height: calc(100% - ${ Math.round( margin * 0.5 ) }px) !important;
    }
    .bea-canvas[data-family="story-feed-card-bottom-bleed"] > .bea-image {
      align-self: end;
      height: calc(100% + ${ margin }px - ${ Math.round( margin * 0.5 ) }px) !important;
    }
    .bea-canvas[data-family="horizontal-image-title"] > .bea-image {
      justify-self: start;
      width: calc(100% - ${ margin }px) !important;
    }
    .bea-canvas[data-family="horizontal-image-title-bleed"] > .bea-image {
      justify-self: start;
      width: 100% !important;
      height: calc(100% + ${ margin * 2 }px) !important;
    }
    .bea-canvas[data-family="horizontal-text-first-image"] > .bea-image {
      justify-self: end;
      width: calc(100% - ${ margin }px) !important;
    }
    .bea-canvas[data-family="horizontal-text-first-image-bleed"] > .bea-image {
      justify-self: end;
      width: 100% !important;
      height: calc(100% + ${ margin * 2 }px) !important;
    }
    .bea-canvas[data-family="horizontal-image-logo-bleed"] > .bea-image {
      align-self: start;
      width: calc(100% + ${ margin * 2 }px) !important;
      height: calc(100% + ${ margin }px) !important;
    }
    .bea-canvas[data-family="horizontal-no-image"] > .bea-headline {
      width: 70% !important;
    }
    .bea-canvas[data-has-image="false"][data-family="story-feed-card"] > .bea-headline,
    .bea-canvas[data-has-image="false"][data-family="story-feed-card-bleed"] > .bea-headline,
    .bea-canvas[data-has-image="false"][data-family="story-feed-card-bottom"] > .bea-headline {
      grid-row: 1 / span 8 !important;
      align-self: start !important;
    }
    .bea-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .bea-image--empty { background: ${ colors.accent }; opacity: 0.18; }
    .bea-container {
      display: flex;
      overflow: hidden;
      box-sizing: border-box;
    }
    .bea-container--v { flex-direction: column; }
    .bea-container--h { flex-direction: row; }
    .bea-container--v > .bea-nested { width: auto; max-width: 100%; }
    .bea-container--v.bea-container--align-stretch > .bea-nested { width: 100%; }
    .bea-container--v > .bea-nested.bea-headline,
    .bea-container--v > .bea-nested.bea-quote,
    .bea-container--v > .bea-nested.bea-stat {
      flex: 1 1 auto;
      overflow: hidden;
    }
    .bea-container--v > .bea-nested.bea-dek {
      overflow: hidden;
    }
    .bea-container--h > .bea-nested {
      flex: 1 1 0;
      align-self: stretch;
      min-width: 0;
    }
    .bea-headline {
      margin: 0;
      color: ${ colors.fg };
      font-family: ${ headlineFont };
      font-size: clamp(${ Math.round( short * 0.06 ) }px, ${ Math.round(
				short * 0.14
			) }px, ${ Math.round( short * 0.22 ) }px);
      line-height: ${ input.pack.typography.headlineLineHeight };
      font-weight: ${ input.pack.typography.headlineWeight };
      letter-spacing: ${ input.pack.typography.headlineTracking };
      text-transform: ${ headlineCase };
      text-wrap: pretty;
      overflow-wrap: break-word;
      hyphens: none;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .bea-headline__text {
      display: block;
      width: 100%;
      transform-origin: top left;
    }
    .bea-headline--display {
      font-family: ${ displayFont };
      font-size: clamp(${ Math.round( short * displayMin ) }px, ${ Math.round(
				short * displayPreferred
			) }px, ${ Math.round( short * displayMax ) }px);
      line-height: ${ displayLineHeight };
      letter-spacing: ${ displayTracking };
      font-weight: ${ displayWeight };
      text-transform: ${ displayCase };
      text-wrap: pretty;
      padding-bottom: ${ displayDescenderPad }em;
      margin-bottom: -${ displayDescenderPad }em;
    }
    .bea-canvas[data-family="story-feed-card"] > .bea-headline,
    .bea-canvas[data-family="story-feed-card-bleed"] > .bea-headline,
    .bea-canvas[data-family="story-stat-hero"] > .bea-headline {
      overflow: visible;
    }
    .bea-headline--overlay {
      color: #fff;
      text-shadow: 0 ${ Math.max( 1, Math.round( short * 0.002 ) ) }px ${ Math.max(
				4,
				Math.round( short * 0.012 )
			) }px rgba(0, 0, 0, 0.45);
    }
    .bea-eyebrow {
      color: ${ colors.accent };
      font-size: ${ Math.max( 11, Math.round( short * 0.017 ) ) }px;
      line-height: 1;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: ${ Math.max( 8, Math.round( short * 0.014 ) ) }px;
      min-width: 0;
    }
    .bea-eyebrow::before {
      content: '';
      display: inline-block;
      width: ${ eyebrowRule }px;
      height: ${ ruleWeight }px;
      background: currentColor;
      flex: 0 0 auto;
    }
    .bea-label {
      color: ${ colors.muted };
      font-size: ${ Math.max( 9, Math.round( short * 0.014 ) ) }px;
      line-height: 1;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .bea-dek {
      margin: 0;
      color: ${ colors.muted };
      font-size: ${ Math.max( 14, Math.round( short * 0.03 ) ) }px;
      line-height: 1.32;
      text-wrap: pretty;
      overflow-wrap: break-word;
      overflow: hidden;
    }
    .bea-dek--overlay {
      color: rgba(255, 255, 255, 0.92);
      text-shadow: 0 ${ Math.max( 1, Math.round( short * 0.002 ) ) }px ${ Math.max(
				3,
				Math.round( short * 0.008 )
			) }px rgba(0, 0, 0, 0.4);
    }
    .bea-cta {
      color: ${ colors.fg };
      font-size: ${ Math.max( 12, Math.round( short * 0.021 ) ) }px;
      line-height: 1;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
      display: flex;
      align-items: flex-end;
      gap: ${ ctaArrow }px;
      min-width: 0;
      overflow: hidden;
    }
    .bea-cta__label {
      display: inline-block;
      letter-spacing: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    .bea-cta__arrow {
      display: inline-block;
      font-size: 1.15em;
      letter-spacing: 0;
      line-height: 1;
      flex: 0 0 auto;
    }
    .bea-rule {
      height: ${ ruleWeight }px;
      width: 100%;
      background: ${ colors.fg };
      opacity: 0.6;
      align-self: center;
    }
    .bea-stat {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      color: ${ colors.fg };
      gap: ${ Math.max( 6, Math.round( short * 0.01 ) ) }px;
      overflow: hidden;
      min-width: 0;
    }
    .bea-stat strong {
      color: ${ colors.accent };
      font-family: ${ headlineFont };
      font-size: clamp(${ Math.round( short * 0.2 ) }px, ${ Math.round(
				short * 0.38
			) }px, ${ Math.round( short * 0.5 ) }px);
      line-height: 0.84;
      letter-spacing: -0.01em;
      font-weight: ${ input.pack.typography.headlineWeight };
      display: block;
      max-width: 100%;
      overflow-wrap: anywhere;
    }
    .bea-stat span {
      color: ${ colors.muted };
      font-size: ${ Math.max( 12, Math.round( short * 0.024 ) ) }px;
      line-height: 1.25;
      letter-spacing: 0.02em;
      max-width: 100%;
      overflow-wrap: break-word;
      padding-top: ${ Math.max( 6, Math.round( short * 0.012 ) ) }px;
      border-top: ${ ruleWeight }px solid ${ colors.fg };
    }
    .bea-stat--display {
      justify-content: flex-start;
      gap: ${ Math.max( 12, Math.round( short * 0.024 ) ) }px;
    }
    .bea-stat--display strong {
      flex: 0 0 auto;
      color: ${ colors.fg };
      font-family: ${ displayFont };
      font-size: clamp(${ Math.round( short * 0.24 ) }px, ${ Math.round(
				short * 0.5
			) }px, ${ Math.round( short * 0.7 ) }px);
      line-height: 0.82;
      letter-spacing: ${ displayTracking };
      font-weight: ${ displayWeight };
      text-transform: ${ displayCase };
      white-space: nowrap;
      overflow-wrap: normal;
    }
    .bea-stat--display span {
      flex: 0 0 auto;
      color: ${ colors.muted };
      font-size: ${ Math.max( 20, Math.round( short * 0.036 ) ) }px;
      line-height: 1.3;
      letter-spacing: 0;
      text-transform: none;
      font-weight: 400;
      padding-top: 0;
      border-top: none;
    }
    .bea-quote {
      margin: 0;
      color: ${ colors.fg };
      display: flex;
      flex-direction: column;
      gap: ${ Math.max( 8, Math.round( short * 0.018 ) ) }px;
      min-width: 0;
    }
    .bea-quote blockquote {
      margin: 0;
      font-family: ${ headlineFont };
      font-size: clamp(${ Math.round( short * 0.044 ) }px, ${ Math.round(
				short * 0.075
			) }px, ${ Math.round( short * 0.12 ) }px);
      line-height: 1.12;
      font-style: normal;
      font-weight: ${ input.pack.typography.headlineWeight };
      letter-spacing: ${ input.pack.typography.headlineTracking };
      text-wrap: balance;
      position: relative;
      padding-left: ${ Math.max( 20, Math.round( short * 0.055 ) ) }px;
    }
    .bea-quote blockquote::before {
      content: '“';
      position: absolute;
      left: 0;
      top: -0.18em;
      color: ${ colors.accent };
      font-size: 1.4em;
      line-height: 1;
      font-weight: ${ input.pack.typography.headlineWeight };
    }
    .bea-quote figcaption {
      color: ${ colors.muted };
      font-size: ${ Math.max( 11, Math.round( short * 0.019 ) ) }px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-weight: 700;
      padding-left: ${ Math.max( 20, Math.round( short * 0.055 ) ) }px;
    }
  `;

	const blocks = layout.blocks
		.map( ( block ) => renderBlock( input, block, colors, margin ) )
		.join( '\n' );
	const scopedCss = scopeCss( css, renderClass );
	return {
		size,
		html: `<div class="${ renderClass }"><style>${ scopedCss }</style><div class="bea-canvas" data-family="${ attr(
			input.family.id
		) }" data-size="${ input.sizeKey }" data-theme="${ input.theme }" data-has-image="${
			hasImage ? 'true' : 'false'
		}">${ blocks }</div></div>`,
	};
}

async function waitForPaint() {
	await new Promise< void >( ( resolve ) =>
		requestAnimationFrame( () => requestAnimationFrame( () => resolve() ) )
	);
	if ( document.fonts?.ready ) {
		await document.fonts.ready;
	}
}

export async function prepareBeaRenderElement( container: HTMLElement ): Promise< void > {
	const canvas = container.querySelector< HTMLElement >( '.bea-canvas' );
	if ( canvas ) {
		const targetWidth = container.clientWidth || Number.parseFloat( container.style.width );
		const targetHeight = container.clientHeight || Number.parseFloat( container.style.height );
		if ( Number.isFinite( targetWidth ) && targetWidth > 0 ) {
			canvas.style.width = `${ targetWidth }px`;
		}
		if ( Number.isFinite( targetHeight ) && targetHeight > 0 ) {
			canvas.style.height = `${ targetHeight }px`;
		}
	}
	await waitForPaint();
	const images = Array.from( container.querySelectorAll( 'img' ) );
	await Promise.all(
		images.map( ( img ) => {
			if ( img.complete && img.naturalWidth > 0 ) {
				return Promise.resolve();
			}
			return new Promise< void >( ( resolve ) => {
				img.addEventListener( 'load', () => resolve(), { once: true } );
				img.addEventListener( 'error', () => resolve(), { once: true } );
			} );
		} )
	);
	fitLogoOverlays( container );
	fitStatHeroNumbers( container );
	fitStoryHeadlines( container );
	shrinkText( container );
	await waitForPaint();
}

function shrinkText( container: HTMLElement ) {
	const targets = Array.from(
		container.querySelectorAll< HTMLElement >(
			'.bea-dek, .bea-quote blockquote, .bea-stat:not(.bea-stat--display) strong, .bea-stat:not(.bea-stat--display) span'
		)
	);
	for ( const el of targets ) {
		const original = Number.parseFloat( getComputedStyle( el ).fontSize );
		let size = original;
		const floor = shrinkFloor( el, original );
		while (
			( el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth ) &&
			size > floor
		) {
			size *= 0.94;
			el.style.fontSize = `${ size }px`;
		}
	}
}

// The stat-hero number is sized and trimmed by its real glyph ink box, not the
// font's advance box. Canvas measureText gives the actual ink extents, so we can
// fill the cell edge to edge and pull the ink flush to the left margin -- the
// same result as converting the number to outlines, without a font parser.
function fitStatHeroNumbers( container: HTMLElement ) {
	const stats = Array.from( container.querySelectorAll< HTMLElement >( '.bea-stat--display' ) );
	const ctx = document.createElement( 'canvas' ).getContext( '2d' );
	for ( const stat of stats ) {
		const strong = stat.querySelector< HTMLElement >( 'strong' );
		if ( ! strong ) {
			continue;
		}
		const label = stat.querySelector< HTMLElement >( 'span' );

		const styles = getComputedStyle( stat );
		const gap = Number.parseFloat( styles.rowGap || styles.gap ) || 0;
		const availW = stat.clientWidth;
		const labelH = label ? label.offsetHeight : 0;
		const availH = stat.clientHeight - labelH - ( label ? gap : 0 );
		if ( availW <= 0 || availH <= 0 ) {
			continue;
		}

		const sStyles = getComputedStyle( strong );
		let text = strong.textContent ?? '';
		if ( sStyles.textTransform === 'uppercase' ) {
			text = text.toUpperCase();
		} else if ( sStyles.textTransform === 'lowercase' ) {
			text = text.toLowerCase();
		}

		// Measure the ink box at a given font size. Returns undefined when the
		// browser does not expose actualBoundingBox metrics.
		const measureInk = ( fontSize: number ) => {
			if ( ! ctx ) {
				return undefined;
			}
			ctx.font = `${ sStyles.fontStyle } ${ sStyles.fontWeight } ${ fontSize }px ${ sStyles.fontFamily }`;
			const m = ctx.measureText( text );
			if (
				! Number.isFinite( m.actualBoundingBoxLeft ) ||
				! Number.isFinite( m.actualBoundingBoxRight ) ||
				! Number.isFinite( m.actualBoundingBoxAscent ) ||
				! Number.isFinite( m.actualBoundingBoxDescent )
			) {
				return undefined;
			}
			return {
				width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
				height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
				// ink left edge measured from the text origin (positive = inset right)
				leftBearing: -m.actualBoundingBoxLeft,
			};
		};

		let lo = 16;
		let hi = Math.max( lo + 1, Math.round( availH * 4 ) );
		const inkFits = ( fontSize: number ): boolean => {
			const ink = measureInk( fontSize );
			if ( ink ) {
				return ink.width <= availW && ink.height <= availH;
			}
			// Fallback: advance-box measurement against the DOM.
			strong.style.fontSize = `${ fontSize }px`;
			return strong.scrollWidth <= availW && strong.scrollHeight <= availH;
		};
		for ( let i = 0; i < 26; i++ ) {
			const mid = ( lo + hi ) / 2;
			if ( inkFits( mid ) ) {
				lo = mid;
			} else {
				hi = mid;
			}
		}

		const finalSize = Math.floor( lo );
		strong.style.fontSize = `${ finalSize }px`;
		const ink = measureInk( finalSize );
		// Trim the left side-bearing so the ink, not the font box, aligns with the
		// logo and the headline below it.
		strong.style.marginLeft = ink ? `${ -ink.leftBearing }px` : '';
	}
}

function fitLogoOverlays( container: HTMLElement ) {
	const overlays = Array.from( container.querySelectorAll< HTMLElement >( '.bea-logo--overlay' ) );
	for ( const overlay of overlays ) {
		const canvas = overlay.closest< HTMLElement >( '.bea-canvas' );
		const photo = canvas?.querySelector< HTMLImageElement >( ':scope > .bea-image img' );
		const logo = overlay.querySelector< HTMLImageElement >( 'img' );
		if ( ! canvas || ! photo || ! logo || ! photo.naturalWidth || ! photo.naturalHeight ) {
			continue;
		}

		const sample = sampleImageLuminance( photo, overlay );
		if ( ! sample ) {
			continue;
		}

		const contrastWithDark = contrastRatio( sample.luminance, 0 );
		const contrastWithLight = contrastRatio( sample.luminance, 1 );
		const useDarkLogo = contrastWithDark >= contrastWithLight;
		const nextLogo = useDarkLogo ? overlay.dataset.logoLight : overlay.dataset.logoDark;
		if ( nextLogo && logo.src !== nextLogo ) {
			logo.src = nextLogo;
		}

		const bestContrast = Math.max( contrastWithDark, contrastWithLight );
		const alpha = bestContrast >= 5 ? 0.1 : bestContrast >= 3.6 ? 0.2 : 0.34;
		overlay.style.setProperty( '--bea-logo-scrim-rgb', useDarkLogo ? '255, 255, 255' : '0, 0, 0' );
		overlay.style.setProperty( '--bea-logo-scrim-alpha-strong', String( alpha ) );
		overlay.style.setProperty( '--bea-logo-scrim-alpha-mid', String( alpha * 0.5 ) );
		overlay.style.setProperty(
			'--bea-logo-shadow',
			useDarkLogo ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.35)'
		);
	}
}

function sampleImageLuminance(
	image: HTMLImageElement,
	overlay: HTMLElement
): { luminance: number } | undefined {
	const imageRect = image.getBoundingClientRect();
	const overlayRect = overlay.getBoundingClientRect();
	if (
		imageRect.width <= 0 ||
		imageRect.height <= 0 ||
		overlayRect.width <= 0 ||
		overlayRect.height <= 0
	) {
		return undefined;
	}

	const canvas = document.createElement( 'canvas' );
	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;
	const ctx = canvas.getContext( '2d', { willReadFrequently: true } );
	if ( ! ctx ) {
		return undefined;
	}

	try {
		ctx.drawImage( image, 0, 0 );
		const scale = Math.max(
			imageRect.width / image.naturalWidth,
			imageRect.height / image.naturalHeight
		);
		const drawnWidth = image.naturalWidth * scale;
		const drawnHeight = image.naturalHeight * scale;
		const offsetX = ( imageRect.width - drawnWidth ) / 2;
		const offsetY = ( imageRect.height - drawnHeight ) / 2;
		const sampleRect = {
			left: Math.max( overlayRect.left - imageRect.left - overlayRect.width * 0.2, 0 ),
			top: Math.max( overlayRect.top - imageRect.top - overlayRect.height * 0.5, 0 ),
			width: Math.min(
				overlayRect.width * 1.6,
				imageRect.right - overlayRect.left + overlayRect.width * 0.2
			),
			height: Math.min(
				overlayRect.height * 2.2,
				imageRect.bottom - overlayRect.top + overlayRect.height * 0.5
			),
		};
		let total = 0;
		let count = 0;
		const cols = 9;
		const rows = 5;
		for ( let y = 0; y < rows; y++ ) {
			for ( let x = 0; x < cols; x++ ) {
				const cssX = sampleRect.left + ( sampleRect.width * ( x + 0.5 ) ) / cols;
				const cssY = sampleRect.top + ( sampleRect.height * ( y + 0.5 ) ) / rows;
				const naturalX = Math.round( ( cssX - offsetX ) / scale );
				const naturalY = Math.round( ( cssY - offsetY ) / scale );
				if (
					naturalX < 0 ||
					naturalY < 0 ||
					naturalX >= image.naturalWidth ||
					naturalY >= image.naturalHeight
				) {
					continue;
				}
				const pixel = ctx.getImageData( naturalX, naturalY, 1, 1 ).data;
				total += rgbLuminance( pixel[ 0 ], pixel[ 1 ], pixel[ 2 ] );
				count += 1;
			}
		}
		if ( ! count ) {
			return undefined;
		}
		return { luminance: total / count };
	} catch {
		return undefined;
	}
}

function rgbLuminance( r: number, g: number, b: number ): number {
	const toLinear = ( value: number ) => {
		const channel = value / 255;
		return channel <= 0.03928 ? channel / 12.92 : ( ( channel + 0.055 ) / 1.055 ) ** 2.4;
	};
	return 0.2126 * toLinear( r ) + 0.7152 * toLinear( g ) + 0.0722 * toLinear( b );
}

function contrastRatio( a: number, b: number ): number {
	const light = Math.max( a, b );
	const dark = Math.min( a, b );
	return ( light + 0.05 ) / ( dark + 0.05 );
}

function fitStoryHeadlines( container: HTMLElement ) {
	const canvases = Array.from(
		container.querySelectorAll< HTMLElement >(
			'.bea-canvas[data-family="horizontal-image-title"], .bea-canvas[data-family="horizontal-image-title-bleed"], .bea-canvas[data-family="horizontal-text-first-image"], .bea-canvas[data-family="horizontal-text-first-image-bleed"], .bea-canvas[data-family="horizontal-no-image"], .bea-canvas[data-family="story-feed-card"], .bea-canvas[data-family="story-feed-card-bleed"], .bea-canvas[data-family="story-feed-card-bottom"], .bea-canvas[data-family="story-feed-card-bottom-bleed"], .bea-canvas[data-family="story-stat-hero"]'
		)
	);
	for ( const canvas of canvases ) {
		const headline = canvas.querySelector< HTMLElement >( ':scope > .bea-headline' );
		const text = headline?.querySelector< HTMLElement >( '.bea-headline__text' );
		const logo = canvas.querySelector< HTMLElement >( ':scope > .bea-logo' );
		const image = canvas.querySelector< HTMLElement >( ':scope > .bea-image' );
		if ( ! headline || ! text ) {
			continue;
		}

		delete headline.dataset.fitTransform;
		headline.style.fontSize = '';
		text.style.transformOrigin = 'top left';
		text.style.transform = 'scale(1)';

		const padding = Number.parseFloat( getComputedStyle( canvas ).paddingTop ) || 0;
		const requiredGap = padding * 0.5;
		const headlineTop = headline.offsetTop;
		const isHorizontal =
			canvas.dataset.family === 'horizontal-image-title' ||
			canvas.dataset.family === 'horizontal-image-title-bleed' ||
			canvas.dataset.family === 'horizontal-text-first-image' ||
			canvas.dataset.family === 'horizontal-text-first-image-bleed' ||
			canvas.dataset.family === 'horizontal-no-image';
		const bottomLimit =
			( canvas.dataset.family === 'story-feed-card-bottom' ||
				canvas.dataset.family === 'story-feed-card-bottom-bleed' ) &&
			image
				? image.offsetTop - requiredGap
				: logo && logo.offsetTop > headlineTop
				? logo.offsetTop - requiredGap
				: canvas.clientHeight - padding;

		fitHeadlineByMeasuredLines( {
			headline,
			text,
			headlineTop,
			bottomLimit,
			isHorizontal,
		} );
	}
}

function fitHeadlineByMeasuredLines( args: {
	headline: HTMLElement;
	text: HTMLElement;
	headlineTop: number;
	bottomLimit: number;
	isHorizontal: boolean;
} ) {
	const original = Number.parseFloat( getComputedStyle( args.headline ).fontSize );
	if ( ! Number.isFinite( original ) || original <= 0 ) {
		return;
	}

	const hardFloor = shrinkFloor( args.headline, original );
	const balanceFloor = Math.max( hardFloor, original * ( args.isHorizontal ? 0.72 : 0.82 ) );
	const sizes = candidateFontSizes( original, balanceFloor );
	let best: { size: number; score: number; overflowX: number; overflowY: number } | undefined;

	for ( const size of sizes ) {
		args.headline.style.fontSize = `${ size }px`;
		args.text.style.transform = 'scale(1)';
		const overflow = headlineOverflow(
			args.headline,
			args.text,
			args.headlineTop,
			args.bottomLimit
		);
		const ratio = size / original;
		const score =
			scoreHeadlineCandidate( args.text, ratio, args.isHorizontal ) +
			( overflow.x + overflow.y ) * 1000;
		if ( ! best || score < best.score ) {
			best = { size, score, overflowX: overflow.x, overflowY: overflow.y };
		}
	}

	if ( ! best ) {
		return;
	}
	args.headline.style.fontSize = `${ best.size }px`;
	args.text.style.transform = 'scale(1)';

	let overflow = headlineOverflow( args.headline, args.text, args.headlineTop, args.bottomLimit );
	if ( ( overflow.x > 0 || overflow.y > 0 ) && best.size > hardFloor ) {
		for ( let size = best.size * 0.94; size >= hardFloor; size *= 0.94 ) {
			args.headline.style.fontSize = `${ size }px`;
			overflow = headlineOverflow( args.headline, args.text, args.headlineTop, args.bottomLimit );
			if ( overflow.x <= 0 && overflow.y <= 0 ) {
				return;
			}
		}
	}

	overflow = headlineOverflow( args.headline, args.text, args.headlineTop, args.bottomLimit );
	if ( overflow.x <= 0 && overflow.y <= 0 ) {
		return;
	}

	args.headline.dataset.fitTransform = 'true';
	for ( let scale = 0.96; scale >= 0.3; scale = Math.round( ( scale - 0.04 ) * 100 ) / 100 ) {
		args.text.style.transform = `scale(${ scale })`;
		if (
			args.headlineTop + args.text.scrollHeight * scale <= args.bottomLimit &&
			args.text.scrollWidth * scale <= args.headline.clientWidth
		) {
			break;
		}
	}
}

function candidateFontSizes( original: number, floor: number ): number[] {
	const sizes: number[] = [];
	for (
		let ratio = 1;
		ratio >= floor / original;
		ratio = Math.round( ( ratio - 0.04 ) * 100 ) / 100
	) {
		sizes.push( original * ratio );
	}
	if ( sizes[ sizes.length - 1 ] !== floor ) {
		sizes.push( floor );
	}
	return sizes;
}

function headlineOverflow(
	headline: HTMLElement,
	text: HTMLElement,
	headlineTop: number,
	bottomLimit: number
): { x: number; y: number } {
	return {
		x: Math.max( 0, text.scrollWidth - headline.clientWidth ),
		y: Math.max( 0, headlineTop + text.scrollHeight - bottomLimit ),
	};
}

const CONNECTOR_WORDS = new Set( [
	'and',
	'or',
	'but',
	'for',
	'to',
	'of',
	'in',
	'on',
	'with',
	'from',
	'by',
	'at',
] );

function scoreHeadlineCandidate( text: HTMLElement, ratio: number, isHorizontal: boolean ): number {
	const content = ( text.textContent ?? '' ).trim().replace( /\s+/g, ' ' );
	const words = content.split( /\s+/ ).filter( Boolean );
	const lines = estimateHeadlineLines( text );
	if ( words.length < 4 || lines.length < 2 ) {
		return ( 1 - ratio ) * 80;
	}

	const lineLengths = lines.map( ( line ) => line.text.length );
	const averageChars =
		lineLengths.reduce( ( sum, length ) => sum + length, 0 ) / lineLengths.length;
	const averageWords = words.length / lines.length;
	const last = lines[ lines.length - 1 ];
	const lastWords = last.text.split( /\s+/ ).filter( Boolean );
	const shrinkPenalty = ( 1 - ratio ) * ( words.length >= 10 ? 28 : 68 );
	const targetAverageWords = words.length >= 14 ? 3 : words.length >= 10 ? 2.5 : 1.8;
	const avgWordsPenalty =
		Math.max( 0, targetAverageWords - averageWords ) * ( isHorizontal ? 22 : 14 );
	const lineCountPenalty = lines.length * ( words.length >= 10 ? 2.2 : 0.8 );
	const raggedness =
		lineLengths.reduce( ( sum, length ) => sum + Math.abs( length - averageChars ), 0 ) /
		lines.length;

	let score =
		shrinkPenalty +
		avgWordsPenalty +
		lineCountPenalty +
		( raggedness / Math.max( 1, averageChars ) ) * 10;
	if ( lastWords.length === 1 ) {
		score += words.length >= 8 ? 140 : 90;
	}
	if ( last.text.length < averageChars * 0.5 ) {
		score += ( averageChars * 0.5 - last.text.length ) * 2;
	}

	lines.forEach( ( line, idx ) => {
		const lineWords = line.text.toLowerCase().split( /\s+/ ).filter( Boolean );
		if ( ! lineWords.length ) {
			return;
		}
		if ( lineWords.length === 1 && CONNECTOR_WORDS.has( lineWords[ 0 ] ) ) {
			score += 180;
		}
		if ( idx < lines.length - 1 && CONNECTOR_WORDS.has( lineWords[ lineWords.length - 1 ] ) ) {
			score += 80;
		}
		if (
			idx === lines.length - 1 &&
			lineWords.length <= 2 &&
			CONNECTOR_WORDS.has( lineWords[ 0 ] )
		) {
			score += 22;
		}
	} );

	return score;
}

function estimateHeadlineLines( el: HTMLElement ): Array< { top: number; text: string } > {
	const doc = el.ownerDocument;
	const range = doc.createRange();
	const fragments: Array< { top: number; text: string } > = [];
	collectTextFragments( el, range, fragments );
	range.detach();

	const grouped: Array< { top: number; parts: string[] } > = [];
	for ( const fragment of fragments ) {
		const group = grouped.find( ( item ) => Math.abs( item.top - fragment.top ) < 2 );
		if ( group ) {
			group.parts.push( fragment.text );
		} else {
			grouped.push( { top: fragment.top, parts: [ fragment.text ] } );
		}
	}

	return grouped
		.sort( ( a, b ) => a.top - b.top )
		.map( ( line ) => ( {
			top: line.top,
			text: line.parts.join( ' ' ).replace( /\s+/g, ' ' ).trim(),
		} ) )
		.filter( ( line ) => line.text.length > 0 );
}

function collectTextFragments(
	node: ChildNode,
	range: Range,
	fragments: Array< { top: number; text: string } >
) {
	if ( node.nodeType === Node.TEXT_NODE ) {
		const text = node.textContent ?? '';
		const matches = text.matchAll( /\S+/g );
		for ( const match of matches ) {
			const start = match.index ?? 0;
			const end = start + match[ 0 ].length;
			range.setStart( node, start );
			range.setEnd( node, end );
			const rect = range.getBoundingClientRect();
			if ( rect.width > 0 && rect.height > 0 ) {
				fragments.push( { top: rect.top, text: match[ 0 ] } );
			}
		}
		return;
	}
	node.childNodes.forEach( ( child ) => collectTextFragments( child, range, fragments ) );
}

function shrinkFloor( el: HTMLElement, original: number ): number {
	if ( el.matches( '.bea-stat strong' ) ) {
		return Math.max( 16, original * 0.24 );
	}
	if ( el.matches( '.bea-headline' ) ) {
		return Math.max( 13, original * 0.22 );
	}
	if ( el.matches( '.bea-quote blockquote' ) ) {
		return Math.max( 14, original * 0.32 );
	}
	return Math.max( 11, original * 0.42 );
}
