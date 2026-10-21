/**
 * Builds the single thumbnail frame an overview card renders, sized at its
 * natural dimensions so the card can scale it down with CSS.
 *
 * - One-pager → the signed `/html` URL in `layout=filmstrip` mode (the wpcom
 *   renderer lays the pages out in a horizontal row and self-fits each). The
 *   frame is a cross-origin `src`, so it loads directly in an iframe — no
 *   fetch, no client-side page splitting, no fit bootstrap.
 * - Social → the client-composed tile wrapped as a same-origin `srcDoc`
 *   (social has no server HTML).
 */
import type { AgentStudioSocialAsset } from '../types';

export interface ThumbnailFrame {
	width: number;
	height: number;
	/** Cross-origin signed URL loaded directly (one-pager filmstrip). */
	src?: string;
	/** Same-origin composed document (social tile). */
	srcDoc?: string;
}

// The representative social tile for the card: the landscape "cover" size.
const SOCIAL_PREVIEW_SIZE_KEY = 'cover';

// US Letter at 96dpi — the renderer's native page canvas.
const PAGE_NATURAL_WIDTH = 816;
const PAGE_NATURAL_HEIGHT = 1056;

// Must match the inter-page gap the wpcom filmstrip layout emits, so the
// frame's declared width matches the document's actual row width.
const FILMSTRIP_GAP = 16;

/**
 * One-pager → one frame whose `src` is the signed `/html` URL switched into
 * filmstrip layout. The row is `pages` page-widths wide (plus gaps); the card
 * scales it to the band height and clips. `null` until the URL is known.
 */
export function buildOnePagerFrame(
	htmlUrl: string | undefined,
	pages: number
): ThumbnailFrame | null {
	if ( ! htmlUrl ) {
		return null;
	}
	const separator = htmlUrl.includes( '?' ) ? '&' : '?';
	return {
		src: `${ htmlUrl }${ separator }layout=filmstrip&pages=${ pages }`,
		width: pages * PAGE_NATURAL_WIDTH + Math.max( 0, pages - 1 ) * FILMSTRIP_GAP,
		height: PAGE_NATURAL_HEIGHT,
	};
}

// Social tile markup is a body fragment (the detail view sets it via
// `innerHTML`). Wrap it in a standalone document so it can be the iframe's
// `srcDoc`, mirroring the capture path's shell: the brand pack's Inter family
// plus a fixed-size, clipped body. No fit pipeline runs — the sandbox is
// cross-origin, so a social tile renders unfitted and clips any overflow.
const wrapSocialTile = ( innerHtml: string, width: number, height: number ): string =>
	[
		'<!doctype html>',
		'<html lang="en">',
		'<head>',
		'<meta charset="utf-8">',
		'<link rel="preconnect" href="https://fonts.googleapis.com">',
		'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
		'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap">',
		'<style>',
		'html,body{margin:0;padding:0;}',
		`body{width:${ width }px;height:${ height }px;overflow:hidden;}`,
		'</style>',
		'</head>',
		`<body>${ innerHtml }</body>`,
		'</html>',
	].join( '' );

/**
 * Social → a single representative tile frame (the landscape "cover" size,
 * first direction). `null` when tiles haven't composed yet or carry no markup
 * (the fallback/empty case), so the card keeps its placeholder.
 */
export function buildSocialFrame(
	assets: AgentStudioSocialAsset[] | undefined
): ThumbnailFrame | null {
	if ( ! assets?.length ) {
		return null;
	}
	const tile =
		assets.find( ( asset ) => asset.sizeKey === SOCIAL_PREVIEW_SIZE_KEY && asset.html ) ??
		assets.find( ( asset ) => asset.html );
	if ( ! tile ) {
		return null;
	}
	return {
		srcDoc: wrapSocialTile( tile.html, tile.width, tile.height ),
		width: tile.width,
		height: tile.height,
	};
}
