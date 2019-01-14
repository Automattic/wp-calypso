/** @format */
/**
 * External dependencies
 */
import { find, includes, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteStyleOptions } from 'lib/signup/site-styles';

const loadedFonts = [];

function fontNameToId( fontName ) {
	return fontName.trim().replace( / /g, '+' );
}

function getLinkHref( font ) {
	const base = 'https://fonts.googleapis.com/css?family=';
	const variations = font.variations.reduce( ( result, variation ) => {
		const weight = variation[ 1 ] + '00';
		const suffix = variation[ 0 ] === 'i' ? 'italic' : '';
		result.push( weight + suffix );
		return result;
	}, [] );
	return `${ base }${ font.id }:${ variations.join( ',' ) }`;
}

function addLinkHrefToHead( href ) {
	const link = document.createElement( 'link' );
	link.rel = 'stylesheet';
	link.media = 'all';
	link.href = href;
	document.querySelector( 'head' ).appendChild( link );
}

function getFont( siteStyle, siteType = 'business' ) {
	if ( isEmpty( siteStyle ) ) {
		siteStyle = 'default';
	}
	const styleOptions = getSiteStyleOptions( siteType );
	const style = find( styleOptions, { id: siteStyle } );
	const font = style.font;
	// nothing here.
	if ( isEmpty( font ) ) {
		return false;
	}

	if ( ! font.id ) {
		font.id = fontNameToId( font.name );
	}
	return font;
}

/**
 * Load a Google Font for our current site type and style
 * @param {string} siteStyle The currently chosen site style
 * @param {string} siteType The currently chosen site type
 */
export function loadFont( siteStyle, siteType ) {
	// will only work in the browser
	if ( ! document ) {
		return;
	}
	const font = getFont( siteStyle, siteType );
	// no font, or font previously loaded? bye.
	if ( ! font || includes( loadedFonts, font.id ) ) {
		return;
	}

	addLinkHrefToHead( getLinkHref( font ) );
	loadedFonts.push( font.id );
}

/**
 * Generate CSS to render the font.
 * @param {string} selector A CSS selector that the font should be applied to
 * @param {string} siteStyle The currently chosen site style
 * @param {string} siteType The currently chosen site type
 * @return {string} CSS text suitable for placing in a `<style>` element
 */
export function getCSS( selector, siteStyle, siteType = 'business' ) {
	const font = getFont( siteStyle, siteType );
	if ( ! font ) {
		return '';
	}
	return `${ selector } {
	font-family: "${ font.name }", monospace;
}`;
}

/**
 * Load a Google Font for our current site type and style, and provide CSS to render the font.
 * @param {string} siteStyle The currently chosen site style
 * @param {string} siteType The currently chosen site type
 * @param {string} selector A CSS selector that the font should be applied to
 * @return {string} CSS text suitable for placing in a `<style>` element
 */
export default function loadFontandGetCSS( siteStyle, siteType, selector ) {
	loadFont( siteStyle, siteType );
	return getCSS( selector, siteStyle, siteType );
}
