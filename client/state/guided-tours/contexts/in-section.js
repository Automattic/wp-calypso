/**
 * Internal dependencies
 */
import { getSectionName } from 'calypso/state/ui/selectors';

/**
 * Returns a selector that tests if the current user is in a given section
 *
 * @param {string} sectionName Name of section
 * @returns {Function} Selector function
 */
export const inSection = ( sectionName ) => ( state ) => getSectionName( state ) === sectionName;
