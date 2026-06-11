/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import PostCommentList from '../post-comment-list';

jest.mock( '../form-root', () => () => null );

jest.mock( '../post-comment', () => ( props ) => (
	<li data-testid="post-comment">{ props.commentId }</li>
) );

const post = {
	ID: 456,
	site_ID: 123,
	discussion: {
		comment_count: 2,
		comments_open: true,
	},
};

// A deep-link scenario whose starting comment has not yet loaded
// (`startingCommentId` set, `initialComment` still undefined). This is the
// branch of `initialFetches` that has no "already loaded" latch, so before the
// guard it re-issued a fetch on *every* prop-driven update — the seed of the
// React 19 "maximum update depth exceeded" loop.
const deepLinkProps = ( overrides = {} ) => ( {
	post,
	commentCount: 2,
	startingCommentId: 789,
	initialComment: undefined,
	isInitialCommentLoading: false,
	commentsTree: { children: [] },
	commentsFetchingStatus: {
		haveEarlierCommentsToFetch: true,
		haveLaterCommentsToFetch: false,
	},
	showCommentCount: false,
	setActiveReply: jest.fn(),
	fetchEarlierComments: jest.fn(),
	fetchLaterComments: jest.fn(),
	...overrides,
} );

const renderList = ( props ) => {
	const renderElement = ( nextProps ) => <PostCommentList { ...nextProps } />;
	const result = render( renderElement( props ) );
	return {
		...result,
		rerenderList: ( nextProps ) => result.rerender( renderElement( nextProps ) ),
	};
};

describe( 'PostCommentList update-depth guard', () => {
	it( 'does not re-run initial fetches when an unrelated prop changes', () => {
		const fetchEarlierComments = jest.fn();
		const commentsTree = { children: [] };
		const props = deepLinkProps( { fetchEarlierComments, commentsTree } );

		const { rerenderList } = renderList( props );

		// Mounting kicks off the initial fetch for the unloaded starting comment.
		expect( fetchEarlierComments ).toHaveBeenCalledTimes( 1 );
		fetchEarlierComments.mockClear();

		// An unrelated prop changes (same commentsTree reference, same fetch
		// inputs). Without the guard this re-entered initialFetches and fired the
		// fetch again, feeding the update-depth loop.
		rerenderList(
			deepLinkProps( { fetchEarlierComments, commentsTree, shouldHighlightNew: true } )
		);

		expect( fetchEarlierComments ).not.toHaveBeenCalled();
	} );

	it( 'still re-runs initial fetches when a fetch input changes', () => {
		const fetchEarlierComments = jest.fn();
		const props = deepLinkProps( { fetchEarlierComments, commentsTree: { children: [] } } );

		const { rerenderList } = renderList( props );

		expect( fetchEarlierComments ).toHaveBeenCalledTimes( 1 );
		fetchEarlierComments.mockClear();

		// A fresh commentsTree reference (e.g. a page of comments arriving) is a
		// real input to the fetch decision, so the guard must let it through while
		// the starting comment is still unloaded.
		rerenderList( deepLinkProps( { fetchEarlierComments, commentsTree: { children: [] } } ) );

		expect( fetchEarlierComments ).toHaveBeenCalledTimes( 1 );
	} );
} );
