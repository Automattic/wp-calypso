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
import { find } from 'lodash';

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

export function preload( sectionName ) {
	const section = find( sections, { name: sectionName } );

	if ( section ) {
		section.load();
	}
}

export function load( sectionName, moduleName ) {
	const section = find( sections, { name: sectionName, module: moduleName } );

	if ( ! section ) {
		return Promise.reject(
			`Attempting to load non-existent section: ${ sectionName } (module=${ moduleName })`
		);
	}

	// section.load() loads the module synchronously (using require()) in environments without
	// code splitting. The return value must be explicitly resolved to Promise.
	return Promise.resolve( section.load() );
}
