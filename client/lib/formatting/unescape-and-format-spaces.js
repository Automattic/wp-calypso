import { decodeEntities } from './decode-entities';

const nbsp = String.fromCharCode( 160 );

/**
 * Unescape HTML entities, then replace spaces with &nbsp;.
 *
 * This helper is used to transform tag names for rendering by React.  We need
 * to decode HTML entities in tag names because the REST API returns them
 * already escaped, and React will escape them again.  Also transform spaces to
 * non-breaking spaces so that tags like 'a   b' will display correctly (not
 * using '&nbsp;' for this because again, React will escape whatever we pass
 * in).
 * @param	{string} str String to unescape in preparation for React rendering
 * @returns	{string} Transformed string
 */
export function unescapeAndFormatSpaces( str ) {
	return decodeEntities( str ).replace( / /g, nbsp );
}
