import wpcomMultiLevelTlds from './tlds/wpcom-multi-level-tlds.json';
import { parseDomainAgainstTldList } from './utils';

/**
 * Parse the tld from a given domain name, semi-naively. The function
 * first parses against a list of tlds that have been sold on WP.com
 * and falls back to a simplistic "everything after the last dot" approach
 * if the list of explicitly allowed tlds failed. This is ultimately not comprehensive as that
 * is a poor base assumption (lots of second level tlds, etc). However,
 * for our purposes, the approach should be "good enough" for a long time.
 * @param {string}     domainName     The domain name parse the tld from
 * @returns {string}                   The TLD or an empty string
 */
export function getTld( domainName ) {
	const lastIndexOfDot = domainName.lastIndexOf( '.' );

	if ( lastIndexOfDot === -1 ) {
		return '';
	}

	let tld = parseDomainAgainstTldList( domainName, wpcomMultiLevelTlds );

	if ( ! tld ) {
		tld = domainName.substring( lastIndexOfDot + 1 );
	}

	return tld;
}
