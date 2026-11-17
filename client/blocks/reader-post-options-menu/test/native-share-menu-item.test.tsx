/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { NativeShareMenuItem } from '../native-share-menu-item';
import PostEllipsisMenu from '../reader-post-ellipsis-menu';

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
	recordTrackForPost: jest.fn(),
} ) );

jest.mock( 'calypso/reader/data/seen-posts', () => ( {
	useCanMarkSeen: () => false,
	withSeenPostsMutations: ( Component: React.ComponentType ) => Component,
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn( () => ( { type: 'TEST_READER_SHARE' } ) ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( () => ( { type: 'TEST_SHARE_ERROR' } ) ),
} ) );

describe( 'NativeShareMenuItem', () => {
	const post = {
		URL: 'https://example.com/a-post?source=reader#content',
		title: 'A post to share',
		blog_id: 1,
		post_id: 2,
		feed_id: 3,
		feed_item_id: 4,
		railcar: {},
		is_external: true,
		site_ID: 1,
		ID: 2,
		feed_ID: 3,
		feed_item_ID: 4,
		is_jetpack: false,
	};
	const shareData = { title: post.title, url: post.URL };
	const originalShare = Object.getOwnPropertyDescriptor( navigator, 'share' );
	const originalCanShare = Object.getOwnPropertyDescriptor( navigator, 'canShare' );
	let sharePost: jest.Mock;
	let canShare: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		sharePost = jest.fn().mockResolvedValue( undefined );
		canShare = jest.fn().mockReturnValue( true );
		Object.defineProperty( navigator, 'share', { configurable: true, value: sharePost } );
		Object.defineProperty( navigator, 'canShare', { configurable: true, value: canShare } );
		jest.spyOn( window, 'open' ).mockImplementation( () => null );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		for ( const [ key, descriptor ] of [
			[ 'share', originalShare ],
			[ 'canShare', originalCanShare ],
		] as const ) {
			if ( descriptor ) {
				Object.defineProperty( navigator, key, descriptor );
			} else {
				Reflect.deleteProperty( navigator, key );
			}
		}
	} );

	const renderMenu = ( selectedPost = post ) => {
		const store = createStore( ( state = {} ) => state );
		return renderWithProvider(
			<EllipsisMenu>
				<NativeShareMenuItem post={ selectedPost } />
				<PopoverMenuItem>Visit post</PopoverMenuItem>
			</EllipsisMenu>,
			{ store }
		);
	};

	test( 'shares the post URL and title and closes the menu while the share sheet is pending', async () => {
		const user = userEvent.setup();
		renderMenu();
		await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );

		let finishSharing: () => void = () => {};
		sharePost.mockReturnValue(
			new Promise< void >( ( resolve ) => {
				finishSharing = resolve;
			} )
		);
		await user.click( screen.getByRole( 'menuitem', { name: 'Share via device' } ) );

		expect( canShare ).toHaveBeenCalledWith( shareData );
		expect( sharePost ).toHaveBeenCalledTimes( 1 );
		expect( sharePost ).toHaveBeenCalledWith( shareData );
		expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_share_action_picked',
			{ action: 'native' },
			{ post }
		);
		expect( errorNotice ).not.toHaveBeenCalled();
		expect( window.open ).not.toHaveBeenCalled();

		await act( async () => finishSharing() );
		await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );
		expect( screen.getByRole( 'menuitem', { name: 'Share via device' } ) ).toBeVisible();
	} );

	test( 'works without navigator.canShare when navigator.share is available', async () => {
		Object.defineProperty( navigator, 'canShare', { value: undefined } );
		const user = userEvent.setup();
		renderMenu();
		await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Share via device' } ) );
		expect( sharePost ).toHaveBeenCalledWith( shareData );
	} );

	test.each( [ 'missing API', 'unsupported data', 'missing URL' ] )(
		'hides the action for %s while keeping other menu items',
		async ( reason ) => {
			if ( reason === 'missing API' ) {
				Object.defineProperty( navigator, 'share', { value: undefined } );
			}
			if ( reason === 'unsupported data' ) {
				canShare.mockReturnValue( false );
			}
			const user = userEvent.setup();
			renderMenu( reason === 'missing URL' ? { ...post, URL: '' } : post );
			await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );
			expect( screen.queryByRole( 'menuitem', { name: 'Share via device' } ) ).toBeNull();
			expect( screen.getByRole( 'menuitem', { name: 'Visit post' } ) ).toBeVisible();
			expect( sharePost ).not.toHaveBeenCalled();
		}
	);

	test( 'allows keyboard selection without opening the post', async () => {
		const user = userEvent.setup();
		const openPost = jest.fn();
		const store = createStore( ( state = {} ) => state );
		renderWithProvider(
			<a href={ post.URL } onClick={ openPost }>
				<NativeShareMenuItem post={ post } />
			</a>,
			{ store }
		);
		screen.getByRole( 'menuitem', { name: 'Share via device' } ).focus();
		await user.keyboard( '{Enter}' );
		expect( sharePost ).toHaveBeenCalledWith( shareData );
		expect( openPost ).not.toHaveBeenCalled();
	} );

	test( 'treats dismissal of the share sheet as cancellation', async () => {
		sharePost.mockRejectedValue( new DOMException( 'Cancelled', 'AbortError' ) );
		const user = userEvent.setup();
		renderMenu();
		await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Share via device' } ) );
		expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();
		expect( errorNotice ).not.toHaveBeenCalled();
	} );

	test.each( [ 'rejected promise', 'synchronous error' ] )(
		'reports a sharing failure from a %s',
		async ( failure ) => {
			const error = new DOMException( 'Sharing is blocked', 'NotAllowedError' );
			if ( failure === 'synchronous error' ) {
				sharePost.mockImplementation( () => {
					throw error;
				} );
			} else {
				sharePost.mockRejectedValue( error );
			}
			const user = userEvent.setup();
			renderMenu();
			await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Share via device' } ) );
			await waitFor( () =>
				expect( errorNotice ).toHaveBeenCalledWith( 'Unable to share this post. Please try again.' )
			);
			expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();
		}
	);

	test( 'is available in the actual post options menu', async () => {
		const user = userEvent.setup();
		const store = createStore( ( state = { currentUser: { id: 1 } } ) => state );
		renderWithProvider(
			<PostEllipsisMenu
				post={ post }
				teams={ [] }
				showFollow={ false }
				showConversationFollow={ false }
				showEditPost={ false }
			/>,
			{ store }
		);
		await user.click( screen.getByRole( 'button', { name: 'Toggle menu' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Share via device' } ) );
		expect( sharePost ).toHaveBeenCalledWith( shareData );
		expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();
	} );
} );
