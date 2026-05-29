import { prepareBeaRenderElement } from './renderBeaPng';

interface CaptureSize {
	width: number;
	height: number;
}

/**
 * Mount the tile HTML offscreen, run the same DOM-based fitting
 * pipeline `HtmlRenderPreview` uses on screen, then serialise the
 * post-fit subtree to a static HTML document Browserless can paint
 * without running any JS.
 *
 * The rasterisation step lives server-side now (the wpcom
 * `social/.../png` endpoint hands the captured HTML to Browserless and
 * caches the resulting attachment URL on the collateral post). The
 * client only has to produce a deterministic, post-fit HTML snapshot.
 */
export async function captureFittedTileHtml( html: string, size: CaptureSize ): Promise< string > {
	const wrapper = document.createElement( 'div' );
	wrapper.style.cssText =
		'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-1';
	const container = document.createElement( 'div' );
	container.style.cssText = `width:${ size.width }px;height:${ size.height }px;opacity:0`;
	container.innerHTML = html;
	wrapper.appendChild( container );
	document.body.appendChild( wrapper );

	try {
		await prepareBeaRenderElement( container );
		return wrapPostFitHtml( container.innerHTML, size );
	} finally {
		wrapper.remove();
	}
}

/**
 * Wrap the post-fit inner HTML in a minimal document Browserless can
 * load. Fonts come from Google Fonts (already on the Browserless
 * allowlist); images and logos are portfolio-blog URLs (also
 * allowlisted), so the only stylesheet we have to inject is the
 * Inter family the prototype's default brand pack uses for body and
 * display copy. Brand-pack overrides that load a non-Inter family
 * will rasterise with whatever Browserless can resolve — acceptable
 * for v1 because the fitting math already ran client-side, so the
 * geometry doesn't depend on the server's glyph metrics.
 */
function wrapPostFitHtml( innerHtml: string, size: CaptureSize ): string {
	return [
		'<!doctype html>',
		'<html lang="en">',
		'<head>',
		'<meta charset="utf-8">',
		'<link rel="preconnect" href="https://fonts.googleapis.com">',
		'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
		'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap">',
		'<style>',
		'html,body{margin:0;padding:0;background:transparent;}',
		`body{width:${ size.width }px;height:${ size.height }px;overflow:hidden;}`,
		'</style>',
		'</head>',
		`<body>${ innerHtml }</body>`,
		'</html>',
	].join( '' );
}
