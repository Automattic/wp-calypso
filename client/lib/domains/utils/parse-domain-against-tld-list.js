/**
 * External dependencies
 */
import { drop, join, split } from 'lodash';

export function parseDomainAgainstTldList( domainFragment, tldList ) {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList[ domainFragment ] !== undefined ) {
		return domainFragment;
	}

	const parts = split( domainFragment, '.' );
	const suffix = join( drop( parts ), '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}
