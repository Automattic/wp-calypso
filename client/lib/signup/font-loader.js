/** @format */
/**
 * External dependencies
 */
import { find, includes, isEmpty, forEach, map } from 'lodash';
import FontFaceObserver from 'fontfaceobserver';

/**
 * Internal dependencies
 */
import { getSiteStyleOptions, siteStyleOptions } from 'lib/signup/site-styles';

const loadedFonts = [];
const addedFonts = [];

function fvdToFontWeightAndStyle( fvd ) {
	const weight = fvd[ 1 ] + '00';
	const style = fvd[ 0 ] === 'i' ? 'italic' : 'normal';
	return { weight, style };
}

function fontNameToId( fontName ) {
	return fontName.trim().replace( / /g, '+' );
}

function getLinkHref( font ) {
	const base = 'https://fonts.googleapis.com/css?family=';
	const variations = font.variations.reduce( ( result, variation ) => {
		const { weight, style } = fvdToFontWeightAndStyle( variation );
		const suffix = style === 'italic' ? 'italic' : '';
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
 * @return {Promise} Promise object representing success of font loading
 */
export function loadFont( siteStyle, siteType ) {
	// will only work in the browser
	if ( ! document ) {
		return Promise.reject( 'only in a browser' );
	}
	const font = getFont( siteStyle, siteType );
	if ( ! font ) {
		return Promise.reject( 'No font found' );
	}
	if ( includes( loadedFonts, font.id ) ) {
		return Promise.resolve( 'Already loaded' );
	}
	// only load if this is the first time
	// separating "loading" from "adding" to prevent multiple adds
	if ( ! includes( addedFonts, font.id ) ) {
		addLinkHrefToHead( getLinkHref( font ) );
		addedFonts.push( font.id );
	}

	// load all of 'em
	const observers = map( font.variations, variation => {
		const opts = fvdToFontWeightAndStyle( variation );
		return new FontFaceObserver( font.name, opts ).load();
	} );

	const all = Promise.all( observers );
	all.then( () => loadedFonts.push( font.id ) );
	return all;
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
	const loadingSelector = '.is-font-loading ' + selector;
	return `${ selector } {
	font-family: "${ font.name }", serif;
}
${ loadingSelector } p,
${ loadingSelector } span,
${ loadingSelector } .site-mockup__title,
${ loadingSelector } .site-mockup__tagline,
${ loadingSelector } h1,
${ loadingSelector } h2,
${ loadingSelector } h3 {
	opacity: 0;
}	`;
}

export function preLoadAllFonts() {
	forEach( siteStyleOptions, ( options, siteType ) => {
		forEach( options, siteStyle => loadFont( siteStyle.id, siteType ) );
	} );
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
