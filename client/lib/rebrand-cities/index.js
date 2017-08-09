/**
 * External dependencies
 */
import { v4 as uuid } from 'uuid';

const allHyphens = new RegExp( '-', 'g' );

function uuidWithoutHyphens() {
	return uuid().replace( allHyphens, '' );
}

function generateUniqueSiteUrl( prefix ) {
	return `${ prefix }${ uuidWithoutHyphens() }`;
}

const rebrandCitiesPrefix = 'site';

function generateUniqueRebrandCitiesSiteUrl() {
	return generateUniqueSiteUrl( rebrandCitiesPrefix );
}

export {
	generateUniqueRebrandCitiesSiteUrl,
};
