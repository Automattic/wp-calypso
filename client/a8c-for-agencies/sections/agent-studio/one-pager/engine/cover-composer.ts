// Composes deterministic cover pages from COVER_LAYOUTS × theme. Ported from
// the prototype's composeCoverPage + renderCoverBlock helpers. The LLM never
// emits covers; the framework picks every layout × theme so the user can flip
// covers in the output detail UI without re-running generation.

import { COVER_LAYOUTS, type CoverBlock, type CoverLayout } from './cover-layouts';
import { BLURB_MAX, TITLE_MAX } from './types';

export const FALLBACK_TRANSPARENT_PNG =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function escapeHtml( input: string ): string {
	return input
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}

function renderCoverBlock(
	block: CoverBlock,
	content: { title: string; blurb: string; imageUrl: string; logoUrl: string }
): string {
	const grid = `grid-column: ${ block.col } / span ${ block.colSpan }; grid-row: ${ block.row } / span ${ block.rowSpan };`;
	const attrs: string[] = [ `data-span="${ block.colSpan }"`, `data-rowspan="${ block.rowSpan }"` ];
	if ( block.align ) {
		attrs.push( `data-align="${ block.align }"` );
	}
	if ( block.level ) {
		attrs.push( `data-level="${ block.level }"` );
	}
	if ( block.bleed ) {
		const sides = ( [ 't', 'r', 'b', 'l' ] as const )
			.filter( ( side ) => block.bleed?.[ side ] )
			.join( ' ' );
		if ( sides ) {
			attrs.push( `data-bleed="${ sides }"` );
		}
	}
	const attrStr = attrs.join( ' ' );

	switch ( block.type ) {
		case 'display':
			return `    <section class="b-display" ${ attrStr } style="${ grid }">${ escapeHtml(
				content.title
			) }</section>`;
		case 'headline':
			return `    <section class="b-headline" ${ attrStr } style="${ grid }">${ escapeHtml(
				content.title
			) }</section>`;
		case 'image':
			if ( ! content.imageUrl || content.imageUrl === FALLBACK_TRANSPARENT_PNG ) {
				return `    <div class="b-image b-image--placeholder" ${ attrStr } style="${ grid }; background: var(--accent);"></div>`;
			}
			return `    <figure class="b-image" ${ attrStr } style="${ grid }"><img src="${ content.imageUrl }" alt="" /></figure>`;
		case 'logo':
			if ( ! content.logoUrl ) {
				return `    <div class="b-logo" ${ attrStr } style="${ grid }"></div>`;
			}
			return `    <figure class="b-logo" ${ attrStr } style="${ grid }"><img src="${ content.logoUrl }" alt="" /></figure>`;
		case 'blurb': {
			if ( ! content.blurb ) {
				return '';
			}
			const cls = block.size === 'small' ? 'b-small' : 'b-section';
			return `    <section class="${ cls }" ${ attrStr } style="${ grid }"><p>${ escapeHtml(
				content.blurb
			) }</p></section>`;
		}
		case 'small-body':
			return content.blurb
				? `    <section class="b-small" ${ attrStr } style="${ grid }"><p>${ escapeHtml(
						content.blurb
				  ) }</p></section>`
				: '';
		case 'spacer':
			return '';
	}
}

export function composeCoverPage( args: {
	title: string;
	blurb: string;
	imageUrl: string;
	logoUrl: string;
	layout: CoverLayout;
} ): string {
	const { layout, imageUrl, logoUrl } = args;
	const title = ( args.title ?? '' ).trim().slice( 0, TITLE_MAX );
	const blurb = ( args.blurb ?? '' ).trim().slice( 0, BLURB_MAX );

	const blockHtmls = layout.blocks
		.map( ( block ) => renderCoverBlock( block, { title, blurb, imageUrl, logoUrl } ) )
		.filter( Boolean );

	return `<div class="ela-page" data-role="cover" data-cover-layout="${ layout.id }">
  <header class="page-header"><img src="${ logoUrl || FALLBACK_TRANSPARENT_PNG }" alt="" /></header>
  <main class="page-body">
${ blockHtmls.join( '\n' ) }
  </main>
</div>`;
}

export { COVER_LAYOUTS };
