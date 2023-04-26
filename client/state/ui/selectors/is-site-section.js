import getSectionGroup from './get-section-group';

/**
 * Returns true if the current section is a site-specific section.
 *
 * @param  {Object}  state Global state tree
 * @returns {boolean}       Whether current section is site-specific
 */
export default function isSiteSection( state ) {
	return [ 'sites', 'editor', 'gutenberg' ].includes( getSectionGroup( state ) );
}
