import type { SiteComment } from '@automattic/api-core';

const EMPTY_COMMENTS: SiteComment[] = [];

type CommentsTreeNode = {
	data: SiteComment;
	children: SiteComment[ 'ID' ][];
};

type CommentsTree = {
	children: SiteComment[ 'ID' ][];
	[ commentId: number ]: CommentsTreeNode;
	[ commentId: string ]: CommentsTreeNode | SiteComment[ 'ID' ][] | undefined;
};

const getCommentTimestamp = ( comment: SiteComment ) => {
	const timestamp = Date.parse( comment.date ?? '' );
	return Number.isNaN( timestamp ) ? Number.POSITIVE_INFINITY : timestamp;
};

const sortCommentsByDate = ( comments: SiteComment[] ) =>
	[ ...comments ].sort( ( first, second ) => {
		const firstTimestamp = getCommentTimestamp( first );
		const secondTimestamp = getCommentTimestamp( second );

		if ( firstTimestamp === secondTimestamp ) {
			return 0;
		}

		return firstTimestamp - secondTimestamp;
	} );

export const mergeComments = ( pages: SiteComment[][] ) => {
	const commentsById = new Map< SiteComment[ 'ID' ], SiteComment >();

	pages.flat().forEach( ( comment ) => {
		if ( ! commentsById.has( comment.ID ) ) {
			commentsById.set( comment.ID, comment );
		}
	} );

	return sortCommentsByDate( [ ...commentsById.values() ] );
};

export const filterComments = ( comments: SiteComment[], status: string, authorId?: number ) =>
	comments.filter( ( comment ) => {
		const commentAuthorId = comment.author?.ID;
		if (
			authorId &&
			commentAuthorId &&
			comment.status === 'unapproved' &&
			commentAuthorId !== authorId
		) {
			return false;
		}

		if ( status !== 'all' ) {
			return comment.isPlaceholder || comment.status === status;
		}

		return true;
	} );

export const buildCommentsTree = ( comments: SiteComment[] ) => {
	const tree: CommentsTree = {
		children: [],
	};

	comments.forEach( ( comment ) => {
		tree[ String( comment.ID ) ] = {
			data: comment,
			children: [],
		};
	} );

	comments.forEach( ( comment ) => {
		const parentNode = comment.parent ? tree[ String( comment.parent.ID ) ] : undefined;

		if ( comment.parent && parentNode && ! Array.isArray( parentNode ) ) {
			parentNode.children.push( comment.ID );
		} else if ( comment.parent === false ) {
			tree.children.push( comment.ID );
		}
	} );

	return tree;
};

export const mergeCommentLists = (
	comments: SiteComment[],
	additionalComments: SiteComment[] = EMPTY_COMMENTS
) => mergeComments( [ comments, additionalComments ] );

export const buildCommentsTreeForDisplay = ( {
	comments,
	displayStatus = 'approved',
	authorId,
}: {
	comments: SiteComment[];
	displayStatus?: string;
	authorId?: number;
} ) => buildCommentsTree( filterComments( comments, displayStatus, authorId ) );
