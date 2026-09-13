import type { Subject } from '../types';

// Words that join the action clause to the post title ("… liked your comment on My Post").
// English only: the API renders the subject as one sentence, so there is no structured seam
// to cut on, and the glue varies by note type and locale.
const CONNECTORS = [ 'on', 'in', 'at', 'to', 'for' ];

// The subject trails off into whichever of these the note concerns.
const SUBJECT_RANGE_TYPES = [ 'post', 'comment' ];

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
 * Split a note's subject into what happened and the thing it happened to — the post for
 * a like, the comment for a reply — so the simplified list can lead with the action.
 *
 * Returns null whenever the sentence can't be split confidently — the caller then
 * renders the subject unchanged rather than guessing.
 */
export const splitSubject = ( subject?: Subject ): SimplifiedSubject | null => {
	const text = subject?.text;
	// What the note is about sits at the end of the sentence: the post for a like, the
	// comment for a reply. Take the one reaching furthest right — a subject carrying both
	// is still describing the later one — and let the guard below reject it if it turns
	// out not to close the sentence.
	const target = subject?.ranges
		?.filter( ( { type } ) => SUBJECT_RANGE_TYPES.includes( type ) )
		.reduce(
			( furthest, range ) =>
				! furthest || range.indices[ 1 ] > furthest.indices[ 1 ] ? range : furthest,
			undefined as NonNullable< Subject[ 'ranges' ] >[ number ] | undefined
		);

	if ( ! text || ! target ) {
		return null;
	}

	const [ start, end ] = target.indices;

	// Only split when it ends the sentence. Anything else is a shape we don't understand
	// well enough to rewrite.
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
