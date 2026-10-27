/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import ReaderReblogSelection, { ReblogPost } from '../reblog';

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: () => '/reader',
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
	getLocation: () => 'following',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/components/site-selector', () => ( {
	__esModule: true,
	default: ( { onSiteSelect }: { onSiteSelect: ( slug: string ) => void } ) => (
		<>
			<input aria-label="Search sites" />
			<button onClick={ () => onSiteSelect( 'example.wordpress.com' ) }>Example site</button>
		</>
	),
} ) );

describe( 'ReaderReblogSelection', () => {
	const post: ReblogPost = {
		URL: 'https://example.com/a-post',
		blog_id: 1,
		post_id: 2,
		feed_id: 0,
		feed_item_id: 0,
		railcar: {},
		is_external: false,
		site_ID: 1,
		ID: 2,
		feed_ID: 0,
		feed_item_ID: 0,
		is_jetpack: false,
	};
	let closeMenu: jest.Mock;
	let openPost: jest.Mock;

	beforeEach( () => {
		closeMenu = jest.fn();
		openPost = jest.fn();
		jest.spyOn( HTMLElement.prototype, 'offsetHeight', 'get' ).mockReturnValue( 20 );
		jest.spyOn( window, 'open' ).mockImplementation( () => null );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	const RepostPopoverTestWrapper = () => {
		const trigger = useRef< HTMLButtonElement >( null );
		const [ isVisible, setIsVisible ] = useState( true );
		return (
			<>
				<button ref={ trigger }>Repost</button>
				<button>Outside</button>
				{ /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */ }
				<div onClick={ openPost }>
					{ isVisible && (
						<ReaderReblogSelection
							post={ post }
							popoverProps={ { isVisible, context: trigger } }
							closeMenu={ () => {
								closeMenu();
								setIsVisible( false );
							} }
						/>
					) }
				</div>
			</>
		);
	};

	const renderMenu = () => render( <RepostPopoverTestWrapper /> );

	it( 'keeps the menu open when clicking and typing in search', async () => {
		const user = userEvent.setup();
		renderMenu();

		await waitFor( () => expect( document.activeElement ).toHaveClass( 'popover' ) );
		const search = screen.getByRole( 'textbox', { name: 'Search sites' } );
		await user.click( search );
		await user.type( search, 'example' );

		expect( search ).toHaveFocus();
		expect( search ).toHaveValue( 'example' );
		expect( screen.getByRole( 'heading', { name: 'Repost on' } ) ).toBeVisible();
		expect( closeMenu ).not.toHaveBeenCalled();
		expect( openPost ).not.toHaveBeenCalled();
		expect( window.open ).not.toHaveBeenCalled();
	} );

	it( 'opens the editor and closes the menu when selecting a site', async () => {
		const user = userEvent.setup();
		renderMenu();

		await waitFor( () => expect( document.activeElement ).toHaveClass( 'popover' ) );
		await user.click( screen.getByRole( 'button', { name: 'Example site' } ) );

		expect( window.open ).toHaveBeenCalledWith(
			'/post/example.wordpress.com?url=https%3A%2F%2Fexample.com%2Fa-post&is_post_share=true',
			'_blank'
		);
		expect( closeMenu ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByRole( 'heading', { name: 'Repost on' } ) ).toBeNull();
		expect( openPost ).not.toHaveBeenCalled();
	} );

	it( 'traps Tab inside the popover', async () => {
		const user = userEvent.setup();
		renderMenu();
		await waitFor( () => expect( document.activeElement ).toHaveClass( 'popover' ) );

		await user.tab();
		expect( screen.getByRole( 'textbox', { name: 'Search sites' } ) ).toHaveFocus();
		await user.tab();
		expect( screen.getByRole( 'button', { name: 'Example site' } ) ).toHaveFocus();
		expect( closeMenu ).not.toHaveBeenCalled();
	} );

	it( 'closes on Escape and returns focus to the Repost button', async () => {
		const user = userEvent.setup();
		renderMenu();
		await waitFor( () => expect( document.activeElement ).toHaveClass( 'popover' ) );
		await user.click( screen.getByRole( 'textbox', { name: 'Search sites' } ) );

		// The shared popover still checks the legacy keyCode field.
		fireEvent.keyDown( screen.getByRole( 'textbox', { name: 'Search sites' } ), {
			key: 'Escape',
			keyCode: 27,
		} );

		expect( closeMenu ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByRole( 'heading', { name: 'Repost on' } ) ).toBeNull();
		expect( screen.getByRole( 'button', { name: 'Repost' } ) ).toHaveFocus();
	} );

	it( 'closes when clicking outside the popover', async () => {
		const user = userEvent.setup();
		renderMenu();
		await waitFor( () => expect( document.activeElement ).toHaveClass( 'popover' ) );

		await user.click( screen.getByRole( 'button', { name: 'Outside' } ) );

		expect( closeMenu ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByRole( 'heading', { name: 'Repost on' } ) ).toBeNull();
	} );
} );
