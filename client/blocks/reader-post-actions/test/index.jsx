/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReaderPostActions from '../index';

// Mock the components that are complex to test
jest.mock( 'calypso/blocks/comment-button', () => () => <div data-testid="comment-button" /> );
jest.mock( 'calypso/blocks/reader-share', () => () => <div data-testid="share-button" /> );
jest.mock( 'calypso/reader/like-button', () => () => <div data-testid="like-button" /> );
jest.mock( 'calypso/blocks/reader-freshly-pressed-button', () => ( {
	ReaderFreshlyPressedButton: () => <div data-testid="freshly-pressed-button" />,
} ) );

// Simple mock store
const createMockStore = () => {
	const reducer = ( state = {} ) => state;
	return createStore( reducer );
};

const defaultProps = {
	post: {
		ID: 123,
		site_ID: 456,
		discussion: { comment_count: 5 },
		URL: 'https://example.com/post',
	},
	site: { ID: 456 },
	onCommentClick: jest.fn(),
};

describe( 'ReaderPostActions', () => {
	describe( 'when comments API is disabled', () => {
		it( 'should not render CommentButton', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: true };

			const { queryByTestId } = render(
				<Provider store={ store }>
					<ReaderPostActions { ...props } />
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when comments API is enabled', () => {
		it( 'should render CommentButton when comments are enabled', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: false };

			const { queryByTestId } = render(
				<Provider store={ store }>
					<ReaderPostActions { ...props } />
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );

		it( 'should render CommentButton when commentsApiDisabled is not provided (defaults to false)', () => {
			const store = createMockStore();
			const props = { ...defaultProps };

			const { queryByTestId } = render(
				<Provider store={ store }>
					<ReaderPostActions { ...props } />
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );
	} );
} );
