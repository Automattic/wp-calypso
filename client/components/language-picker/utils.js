/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { find, includes } from 'lodash';
import { TERRITORIES, DEFAULT_TERRITORY } from '../constants';

/**
 * Returns territory slug from constant: TERRITORIES
 *
 * @param {String} countryCode country code id
 * @param {Array} territories collection of territory data
 * @param {String} defaultTerritory default territory slug if none found
 * @returns {String} territory slug
 */
export function getTerritoryFromCountry(
	countryCode,
	territories = TERRITORIES,
	defaultTerritory = DEFAULT_TERRITORY
) {
	const territory = find( territories, t => includes( t.countries, countryCode ) );
	return territory ? territory.id : defaultTerritory;
}

/**
 * Returns territory slug from constant: TERRITORIES
 *
 * @param {String} id territory id
 * @param {Array} territories collection of territory data
 * @returns {String} territory slug
 */
export function getTerritoryById( id, territories = TERRITORIES ) {
	return find( territories, t => t.id === id );
}
