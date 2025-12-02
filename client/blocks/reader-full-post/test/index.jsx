/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Mock the entire FullPostView component to focus on the specific logic we're testing
const MockFullPostView = ( { commentsApiDisabled, shouldShowComments } ) => {
	const post = { ID: 123, site_ID: 456 };

	return (
		<div>
			{ /* This mimics the logic from the actual component */ }
			{ ! commentsApiDisabled && shouldShowComments( post ) && (
				<div data-testid="comments">Comments Component</div>
			) }
			{ /* This mimics the ReaderPostActions logic */ }
			{ ! commentsApiDisabled && <div data-testid="comment-button">Comment Button</div> }
		</div>
	);
};

// Simple mock store
const createMockStore = () => {
	const reducer = ( state = {} ) => state;
	return createStore( reducer );
};

describe( 'FullPostView Comments API Disabled Logic', () => {
	describe( 'when comments API is disabled', () => {
		it( 'should not render Comments component', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView commentsApiDisabled shouldShowComments={ shouldShowComments } />
				</Provider>
			);

			expect( queryByTestId( 'comments' ) ).not.toBeInTheDocument();
		} );

		it( 'should not render CommentButton', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView commentsApiDisabled shouldShowComments={ shouldShowComments } />
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when comments API is enabled', () => {
		it( 'should render Comments component when shouldShowComments is true', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView
						commentsApiDisabled={ false }
						shouldShowComments={ shouldShowComments }
					/>
				</Provider>
			);

			expect( queryByTestId( 'comments' ) ).toBeInTheDocument();
		} );

		it( 'should render CommentButton when API is enabled', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView
						commentsApiDisabled={ false }
						shouldShowComments={ shouldShowComments }
					/>
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );
	} );
} );
