/**
 * External Dependencies
 */
import { trim } from 'lodash';

/**
 * Internal Dependencies
 */

const READING_WORDS_PER_SECOND = 250 / 60; // Longreads says that people can read 250 words per minute. We want the rate in words per second.

export default function wordCountAndReadingTime( post ) {

	const textContent = trim( post.better_excerpt_no_html );

	post.character_count = textContent.length;
	post.word_count = ( textContent.replace( /['";:,.?¿\-!¡]+/g, '' ).match( /\S+/g ) || [] ).length;

	if ( post.word_count > 0 ) {
		post.reading_time = Math.ceil( post.word_count / READING_WORDS_PER_SECOND ); // in seconds
	}

	return post;
}
