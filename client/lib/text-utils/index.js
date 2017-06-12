/**
 * External Dependencies
 */
import { reduce } from 'lodash';

export { diffWords } from 'diff';

export function countWords( content ) {
	// Adapted from TinyMCE wordcount plugin:
	// https://github.com/tinymce/tinymce/blob/4.2.6/js/tinymce/plugins/wordcount/plugin.js

	if ( content && typeof content === 'string' ) {
		// convert ellipses to spaces, remove HTML tags, and remove space chars
		content = content.replace( /\.\.\./g, ' ' );
		content = content.replace( /<.[^<>]*?>/g, ' ' );
		content = content.replace( /&nbsp;|&#160;/gi, ' ' );

		// deal with HTML entities
		content = content.replace( /(\w+)(&#?[a-z0-9]+;)+(\w+)/i, '$1$3' ); // strip entities inside words
		content = content.replace( /&.+?;/g, ' ' ); // turn all other entities into spaces

		// remove numbers and punctuation
		content = content.replace( /[0-9.(),;:!?%#$?\x27\x22_+=\\\/\-]*/g, '' );

		const words = content.match( /[\w\u2019\x27\-\u00C0-\u1FFF]+/g );
		if ( words ) {
			return words.length;
		}
	}

	return 0;
}

export function countDiffWords( diffChanges ) {
	return reduce(
		diffChanges,
		( accumulator, change ) => {
			const count = countWords( change.value );
			if ( change.added ) {
				accumulator.added += count;
			}
			if ( change.removed ) {
				accumulator.removed += count;
			}
			return accumulator;
		},
		{
			added: 0,
			removed: 0,
		},
	);
}
