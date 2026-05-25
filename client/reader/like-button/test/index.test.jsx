/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { upsertPostCache } from 'calypso/reader/data/post/cache';
import { markPostSeen } from 'calypso/reader/mark-post-seen';
import { recordTrackForPost } from 'calypso/reader/stats';
import LikeButton from '../index';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'en';
	config.isEnabled = () => true;

	return {
		__esModule: true,
		default: config,
		isEnabled: config.isEnabled,
	};
} );

jest.mock( '@automattic/viewport', () => ( {
	isMobile: () => true,
} ) );

jest.mock( 'calypso/blocks/like-button', () => ( {
	__esModule: true,
	default: require( 'react' ).forwardRef( ( { onLikeToggle }, ref ) => (
		<button ref={ ref } type="button" onClick={ () => onLikeToggle( true ) }>
			Like
		</button>
	) ),
} ) );

jest.mock( 'calypso/blocks/post-likes/popover', () => ( {
	__esModule: true,
	default: () => <div data-testid="post-likes-popover" />,
} ) );

jest.mock( 'calypso/components/data/post-likes', () => ( {
	withPostLikes: ( WrappedComponent ) => ( props ) => (
		<WrappedComponent { ...props } iLike={ false } likeCount={ 0 } />
	),
} ) );

jest.mock( 'calypso/reader/components/icons/like-icon', () => () => null );

jest.mock( 'calypso/reader/data/post/likes', () => ( {
	withPostLikeActions: ( WrappedComponent ) => ( props ) => <WrappedComponent { ...props } />,
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
	recordTrackForPost: jest.fn(),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: () => true,
} ) );

jest.mock( 'calypso/reader/mark-post-seen', () => ( {
	markPostSeen: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-previous-path', () => () => '/reader' );

const makeStore = () => createStore( ( state = { reader: { posts: { items: {} } } } ) => state );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

describe( 'ReaderLikeButton', () => {
	it( 'uses the canonical Reader post cache when no post prop is provided', async () => {
		const queryClient = makeQueryClient();
		const post = {
			ID: 10,
			site_ID: 100,
			global_ID: 'global-10',
			title: 'Cached post',
			_seen: false,
		};
		upsertPostCache( queryClient, [ post ] );

		render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ makeStore() }>
					<LikeButton siteId={ 100 } postId={ 10 } site={ { ID: 100 } } />
				</Provider>
			</QueryClientProvider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Like' } ) );

		expect( recordTrackForPost ).toHaveBeenCalledWith(
			'calypso_reader_article_liked',
			expect.objectContaining( { ID: 10, site_ID: 100 } ),
			{ context: 'card' },
			{}
		);
		expect( markPostSeen ).toHaveBeenCalledWith(
			expect.objectContaining( { ID: 10, site_ID: 100 } ),
			{ ID: 100 }
		);
	} );
} );
