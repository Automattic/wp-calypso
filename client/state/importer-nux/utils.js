/** @format */
/**
 * External dependencies
 */
import { memoize } from 'lodash';

export const normalizeImportUrl = memoize( ( url = '' ) =>
	url
		.replace( /^https?:\/\/(www)?/gi, '' )
		.replace( /godaddysites(\.com)?/i, '' )
		.replace( /wixsite(\.com)?/i, '' )
		.replace( /[^a-z0-9]/gi, '' )
		.trim()
);
