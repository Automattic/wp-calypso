/** @format */

/**
 * sections-helper
 *
 * In days past, the preloader was part of sections.js. To preload a module you would import sections
 * and call preload directly. However, all of the require.ensure calls live in sections.js. This makes
 * webpack think that imported sections was also dependant on every other chunk. The cyclic dependencies
 * ballooned compile times and made module analysis very difficult.
 *
 * To break the dependency cycle, we introduced `sections-helper` which does not import sections.js
 */

/**
 * External dependencies
 */
import { filter, isEmpty, find } from 'lodash';

/**
 * Internal dependencies
 */
import { switchCSS } from 'lib/i18n-utils/switch-locale';

let sections = null;
export function receiveSections( s ) {
	sections = s;
}

export function getSections() {
	if ( ! sections ) {
		throw new Error( 'sections-helper has not been initialized yet' );
	}
	return sections;
}

function maybeLoadCSS( sectionName ) {
	//eslint-disable-line no-unused-vars
	const section = find( sections, { name: sectionName } );

	if ( ! ( section && section.css ) ) {
		return;
	}

	const url =
		typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
			? section.css.urls.rtl
			: section.css.urls.ltr;

	switchCSS( 'section-css-' + section.css.id, url );
}

export function preload( sectionName ) {
	maybeLoadCSS( sectionName );
	const filteredSections = filter( sections, { name: sectionName } );
	if ( isEmpty( filteredSections ) ) {
		return Promise.reject( `Attempting to load non-existent section: ${ sectionName }` );
	}
	return Promise.all( filteredSections.map( section => section.load() ) );
}
