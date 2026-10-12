import { splitSubject } from '../../note-list/simplified-subject';
import { getBlocks } from './blocks';
import { getRangeText } from './text';
import type { Note } from '../../types';

export type Post = {
	title?: string;
	excerpt?: string;
	url: string;
	siteName?: string;
	siteIcon?: string;
	author?: string;
	date?: string;
};

const toPost = (
	note: Note,
	{ title, excerpt, url }: { title?: string; excerpt?: string; url?: string }
): Post | undefined => {
	if ( ! title && ! excerpt ) {
		return undefined;
	}
	const details = note.meta?.post;
	return {
		title,
		excerpt,
		url: details?.url ?? url ?? note.url,
		siteName: note.meta?.site?.name,
		siteIcon: note.meta?.site?.icon,
		author: details?.author_name,
		date: details?.date ?? undefined,
	};
};

export const isAboutPost = ( note: Note ) => !! note.meta?.ids?.site && !! note.meta?.ids?.post;

/**
 * The post a note is about. Its title ends the sentence, and its excerpt is the note's
 * post block.
 */
export function getPost( note: Note ): Post | undefined {
	return toPost( note, {
		title: note.meta?.post?.title || splitSubject( note.subject[ 0 ] )?.title,
		// A like's card only names the post, since what happened is the news.
		excerpt: note.type === 'like' ? undefined : getBlocks( note, 'post' )[ 0 ]?.text,
	} );
}

// An untitled post borrows its opening words as a title, and a reply's subject ends in
// the comment it answers. Either way the title says nothing the comment doesn't.
const isRestating = ( title: string, text?: string ) => {
	const stem = title.split( /…|\.{3}/ )[ 0 ].trim();
	return !! text && ( ! stem || text.startsWith( stem ) );
};

/** The post a comment sits on, named somewhere in the note's own text. */
export function getCommentedPost( note: Note, repliedToText?: string ): Post | undefined {
	const [ sentence ] = note.subject;
	const [ header ] = note.header ?? [];
	const named = getRangeText( sentence, 'post' ) ?? getRangeText( header, 'post' );
	const postRange = [ sentence, header ]
		.flatMap( ( block ) => block?.ranges ?? [] )
		.find( ( { type } ) => type === 'post' );

	return toPost( note, {
		// The endpoint's title is the real one; only a title read from the note's own text
		// can turn out to be the start of the comment it answers.
		title:
			note.meta?.post?.title ||
			( named && ! isRestating( named, repliedToText ) ? named : undefined ),
		url: postRange?.url,
	} );
}
