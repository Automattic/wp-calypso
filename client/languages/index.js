/**
 * External dependencies
 */
import values from 'lodash/values';

let languagesMeta = [];

try {
	languagesMeta = require( './languages-meta.json' );
} catch ( error ) {
	// Use fallback languages meta data if `languages-meta.json` has failed to download.
	languagesMeta = require( './fallback-languages-meta.json' );
}

export const languages = values( languagesMeta );
