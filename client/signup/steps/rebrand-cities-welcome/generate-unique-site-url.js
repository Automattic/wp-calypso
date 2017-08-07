/**
 * External dependencies
 */
import { v4 as uuid } from 'uuid';

function generateUniqueSiteUrl( prefix ) {
	const uniqueSuffix = uuid().replace( new RegExp( '-', 'g' ), '' );
	return `${ prefix }${ uniqueSuffix }`;
}

export default generateUniqueSiteUrl;
