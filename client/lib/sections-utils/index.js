/**
 * External Dependencies
 */
import escapeRegExp from 'lodash/escapeRegExp';

export function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	return path === '/' ? path : new RegExp( '^' + escapeRegExp( path ) + '(/.*)?$' );
}

export function loadSectionsFactory( sections, createPageDefinition ) {
	return function loadSections() {
		sections.forEach( sectionDefinition =>
			sectionDefinition.paths.forEach( path =>
				createPageDefinition( path, sectionDefinition )
			)
		);
	};
}

export function getSectionsFactory( sections ) {
	return function getSections() {
		return sections;
	};
}
