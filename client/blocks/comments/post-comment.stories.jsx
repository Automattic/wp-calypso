import { Card } from '@automattic/components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import PostComment from './post-comment';

const queryClient = new QueryClient( {
	defaultOptions: { queries: { retry: false } },
} );

const initialState = {
	currentUser: {
		id: 12345678,
		user: {
			ID: 12345678,
			display_name: 'Test User',
			username: 'testuser',
			primary_blog: 200,
		},
	},
};

const store = createStore( ( state = initialState ) => state, applyMiddleware( thunkMiddleware ) );

const post = {
	ID: 100,
	site_ID: 200,
	discussion: { comments_open: true },
};

const avatar = 'https://gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=96';

// Resolves to /reader/users/elenamarsh, so the name renders as a plain link.
const authorWithProfile = {
	ID: 1,
	name: 'Elena Marsh',
	nice_name: 'elenamarsh',
	wpcom_login: 'elenamarsh',
	avatar_URL: avatar,
};

// An off-site https URL, so the name is followed by the external-link icon.
const authorWithExternalSite = {
	ID: 2,
	name: 'Tobias Fenn',
	nice_name: 'tobiasfenn',
	URL: 'https://example.com',
	avatar_URL: avatar,
};

const comment = ( { ID, author, parent, content } ) => ( {
	ID,
	author,
	parent,
	content,
	date: '2026-07-28 16:00:00',
	i_like: false,
	like_count: 3,
	status: 'approved',
	type: 'comment',
	URL: `https://example.com/2026/07/28/a-post/#comment-${ ID }`,
} );

const comments = [
	{ ID: 1, author: authorWithProfile, content: 'A comment with no respondee.' },
	{ ID: 2, author: authorWithExternalSite, content: 'A comment with no respondee.' },
	{
		ID: 3,
		author: authorWithProfile,
		parent: { ID: 1 },
		content: 'A reply — neither name has an icon.',
	},
	{
		ID: 4,
		author: authorWithExternalSite,
		parent: { ID: 1 },
		content: 'A reply — only the author name has an icon.',
	},
	{
		ID: 5,
		author: authorWithProfile,
		parent: { ID: 2 },
		content: 'A reply — only the respondee name has an icon.',
	},
	{
		ID: 6,
		author: authorWithExternalSite,
		parent: { ID: 2 },
		content: 'A reply — both names have an icon.',
	},
].map( comment );

const commentsTree = Object.fromEntries(
	comments.map( ( data ) => [ data.ID, { children: [], data } ] )
);

export default {
	title: 'client/blocks/Comments/PostComment',
	component: PostComment,
	decorators: [
		( Story ) => (
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>
					<Story />
				</Provider>
			</QueryClientProvider>
		),
	],
};

export const AuthorRowVariants = {
	render: () => (
		<Card compact>
			<ol className="comments__list">
				{ comments.map( ( { ID } ) => (
					<PostComment
						key={ ID }
						showNestingReplyArrow
						commentId={ ID }
						depth={ 0 }
						commentsTree={ commentsTree }
						post={ post }
					/>
				) ) }
			</ol>
		</Card>
	),
};
