/**
 * External dependencies
 */
import { sanitize } from 'dompurify';

export const ALLOWED_TAGS = [ 'a', 'strong', 'em', 'u', 'tt', 's' ];
export const ALLOWED_ATTR = [ 'target', 'href' ];

export default ( html ) => {
	return {
		__html: sanitize( html, { ALLOWED_TAGS, ALLOWED_ATTR } ),
	};
};
