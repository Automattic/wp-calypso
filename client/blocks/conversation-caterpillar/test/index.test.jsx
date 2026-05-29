/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ConversationCaterpillar from '..';

const comments = [
	{
		ID: 1,
		author: { name: 'Alice', avatar_URL: 'https://example.com/alice.jpg' },
		parent: false,
	},
	{
		ID: 2,
		author: { name: 'Bob', avatar_URL: 'https://example.com/bob.jpg' },
		parent: false,
	},
];

const commentsTree = {
	children: [ 1, 2 ],
	1: { data: comments[ 0 ], children: [] },
	2: { data: comments[ 1 ], children: [] },
};

describe( 'ConversationCaterpillar', () => {
	const renderCaterpillar = ( props = {} ) => {
		const expandComments = jest.fn();
		const recordReaderTracksEvent = jest.fn();
		const store = createStore(
			( state = { currentUser: { id: 0 }, gravatarStatus: { tempImage: false } } ) => state
		);

		const renderResult = render(
			<Provider store={ store }>
				<ConversationCaterpillar
					blogId={ 100 }
					postId={ 1 }
					commentCount={ 2 }
					comments={ comments }
					commentsTree={ commentsTree }
					commentsToShow={ {} }
					expandComments={ expandComments }
					recordReaderTracksEvent={ recordReaderTracksEvent }
					{ ...props }
				/>
			</Provider>
		);

		return { ...renderResult, expandComments, recordReaderTracksEvent };
	};

	it( 'renders the initial collapsed state from props', () => {
		renderCaterpillar();

		expect( screen.getByText( 'Load previous comments from Bob and others' ) ).toBeVisible();
	} );

	it( 'expands comments from props without requiring Redux state', async () => {
		const { expandComments, recordReaderTracksEvent } = renderCaterpillar();

		await userEvent.click( screen.getByRole( 'button' ) );

		expect( expandComments ).toHaveBeenCalledWith( {
			siteId: 100,
			postId: 1,
			commentIds: [ 1, 2 ],
			displayType: 'is-excerpt',
		} );
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_comment_caterpillar_click',
			{
				blog_id: 100,
				post_id: 1,
			}
		);
	} );

	it( 'reflects closing after opening when the parent updates visibility props', () => {
		const { rerender, expandComments, recordReaderTracksEvent } = renderCaterpillar( {
			commentsToShow: {
				1: 'is-excerpt',
				2: 'is-excerpt',
			},
		} );

		expect(
			screen.queryByText( 'Load previous comments from Bob and others' )
		).not.toBeInTheDocument();

		rerender(
			<Provider
				store={ createStore(
					( state = { currentUser: { id: 0 }, gravatarStatus: { tempImage: false } } ) => state
				) }
			>
				<ConversationCaterpillar
					blogId={ 100 }
					postId={ 1 }
					commentCount={ 2 }
					comments={ comments }
					commentsTree={ commentsTree }
					commentsToShow={ {} }
					expandComments={ expandComments }
					recordReaderTracksEvent={ recordReaderTracksEvent }
				/>
			</Provider>
		);

		expect( screen.getByText( 'Load previous comments from Bob and others' ) ).toBeVisible();
	} );
} );
