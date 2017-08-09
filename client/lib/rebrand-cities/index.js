/**
 * External dependencies
 */
import { v4 as uuid } from 'uuid';

const allHyphens = new RegExp( '-', 'g' );

function generateUniqueSiteUrl( prefix ) {
	const uniqueSuffix = uuid().replace( allHyphens, '' );
	return `${ prefix }${ uniqueSuffix }`;
}

const rebrandCitiesPrefix = 'site';

function generateUniqueRebrandCitiesSiteUrl() {
	return generateUniqueSiteUrl( rebrandCitiesPrefix );
}

export {
	generateUniqueRebrandCitiesSiteUrl,
};
