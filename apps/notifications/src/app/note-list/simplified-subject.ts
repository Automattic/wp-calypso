import type { Subject } from '../types';

// Words that join the action clause to the post title ("… liked your comment on My Post").
// English only: the API renders the subject as one sentence, so there is no structured seam
// to cut on, and the glue varies by note type and locale.
const CONNECTORS = [ 'on', 'in', 'at', 'to', 'for' ];

const TRAILING_PUNCTUATION = /[\s\p{P}]+$/u;
const ONLY_PUNCTUATION = /^[\s\p{P}]*$/u;

export type SimplifiedSubject = {
	title: string;
	action: string;
};

const trimAction = ( text: string ) => {
	const trimmed = text.replace( TRAILING_PUNCTUATION, '' );
	const lastWord = trimmed.split( /\s+/ ).pop() ?? '';

	if ( ! CONNECTORS.includes( lastWord.toLowerCase() ) ) {
		return trimmed;
	}

	return trimmed.slice( 0, trimmed.length - lastWord.length ).replace( TRAILING_PUNCTUATION, '' );
};

/**
 * Split a note's subject into the post it concerns and what happened to it, so the
 * simplified list can show the post on top and the action underneath.
 *
 * Returns null whenever the sentence can't be split confidently — the caller then
 * renders the subject unchanged rather than guessing.
 */
export const splitSubject = ( subject?: Subject ): SimplifiedSubject | null => {
	const text = subject?.text;
	const postRange = subject?.ranges?.find( ( { type } ) => type === 'post' );

	if ( ! text || ! postRange ) {
		return null;
	}

	const [ start, end ] = postRange.indices;

	// Only split when the post title ends the sentence. Anything else is a shape we
	// don't understand well enough to rewrite.
	if ( start <= 0 || ! ONLY_PUNCTUATION.test( text.slice( end ) ) ) {
		return null;
	}

	const title = text.slice( start, end ).trim();
	const action = trimAction( text.slice( 0, start ) );

	if ( ! title || ! action ) {
		return null;
	}

	return { title, action };
};
