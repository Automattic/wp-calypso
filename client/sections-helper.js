/**
 * sections-helper (refactored)
 *
 * Provides helper functions for managing and preloading sections.
 * Modernized to remove lodash dependency and use native Array.find.
 */

let sections = null;

/**
 * Initialize sections
 * @param {Array} s - Array of section objects
 */
export function receiveSections(s) {
	sections = s;
}

/**
 * Get all sections
 * @returns {Array} sections
 * @throws {Error} if sections not initialized
 */
export function getSections() {
	if (!sections) {
		throw new Error('sections-helper has not been initialized yet');
	}
	return sections;
}

/**
 * Preload a section by name
 * @param {string} sectionName
 */
export function preload(sectionName) {
	const section = sections?.find(sec => sec.name === sectionName);

	if (section) {
		section.load();
	}
}

/**
 * Load a section by name and module
 * @param {string} sectionName
 * @param {string} moduleName
 * @returns {Promise<*>}
 */
export function load(sectionName, moduleName) {
	const section = sections?.find(
		sec => sec.name === sectionName && sec.module === moduleName
	);

	if (!section) {
		return Promise.reject(
			new Error(
				`Attempting to load non-existent section: ${sectionName} (module=${moduleName})`
			)
		);
	}

	// section.load() loads the module synchronously (using require()) in environments without
	// code splitting. The return value must be explicitly resolved to Promise.
	return Promise.resolve(section.load());
}
