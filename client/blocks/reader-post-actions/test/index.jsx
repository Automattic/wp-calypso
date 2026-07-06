/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import ReaderPostActions from '../index';

let mockReaderSpacesEnabled = false;
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: ( flag ) => ( flag === 'reader/spaces' ? mockReaderSpacesEnabled : false ),
} ) );

const mockRecordReaderTracksEvent = jest.fn( () => ( { type: 'MOCK_TRACKS_EVENT' } ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// Mock the components that are complex to test
jest.mock( 'calypso/blocks/comment-button', () => () => <div data-testid="comment-button" /> );
jest.mock( 'calypso/blocks/reader-share', () => () => <div data-testid="share-button" /> );
jest.mock( 'calypso/reader/like-button', () => () => <div data-testid="like-button" /> );
jest.mock( 'calypso/blocks/reader-freshly-pressed-button', () => ( {
	ReaderFreshlyPressedButton: () => <div data-testid="freshly-pressed-button" />,
} ) );
jest.mock( 'calypso/reader/spaces/subscribe-with-space/space-picker-modal', () => ( {
	SpacePickerModal: () => null,
} ) );

// Simple mock store
const createMockStore = () => {
	const reducer = ( state = {} ) => state;
	return createStore( reducer );
};

const createQueryClient = () => {
	const client = new QueryClient();
	client.setDefaultOptions( { queries: { retry: false } } );
	return client;
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
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		mockReaderSpacesEnabled = false;
		mockRecordReaderTracksEvent.mockClear();
		nock.cleanAll();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/teams' )
			.reply( 200, { number: 0, teams: [] } );
	} );

	afterAll( () => {
		nock.enableNetConnect();
	} );

	describe( 'when comments API is disabled', () => {
		it( 'should not render CommentButton', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: true };

			const { queryByTestId } = render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( queryByTestId( 'comment-button' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when comments API is enabled', () => {
		it( 'should render CommentButton when comments are enabled', () => {
			const store = createMockStore();
			const props = { ...defaultProps, commentsApiDisabled: false };

			const { queryByTestId } = render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );

		it( 'should render CommentButton when commentsApiDisabled is not provided (defaults to false)', () => {
			const store = createMockStore();
			const props = { ...defaultProps };

			const { queryByTestId } = render(
				<QueryClientProvider client={ createQueryClient() }>
					<Provider store={ store }>
						<ReaderPostActions { ...props } />
					</Provider>
				</QueryClientProvider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );
	} );

	it( 'tracks when the spaces button is clicked', async () => {
		mockReaderSpacesEnabled = true;
		const user = userEvent.setup();
		const store = createMockStore();
		const props = {
			...defaultProps,
			post: {
				...defaultProps.post,
				feed_ID: 789,
				feed_URL: 'https://example.com/feed',
			},
		};

		render(
			<QueryClientProvider client={ createQueryClient() }>
				<Provider store={ store }>
					<ReaderPostActions { ...props } />
				</Provider>
			</QueryClientProvider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Move site to a space' } ) );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_subscribe_space_button_clicked',
			{
				blog_id: 456,
				feed_id: 789,
				source: 'post_actions',
			}
		);
	} );
} );
