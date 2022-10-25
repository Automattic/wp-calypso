/**
 * @jest-environment jsdom
 */

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expectSelectedItems", "expect"] }] */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { useState } from 'react';
import { MediaLibraryList as MediaList } from '../list';
import fixtures from './fixtures';

/**
 * Module variables
 */
const DUMMY_SITE_ID = 2916284;

jest.mock( 'calypso/my-sites/media-library/list-item', () => ( { media: mediaItem, onToggle } ) => (
	<button
		data-testid={ `list-item-${ mediaItem.ID }` }
		onClick={ ( event ) => onToggle( mediaItem, event.shiftKey ) }
	/>
) );
jest.mock( 'calypso/my-sites/media-library/list-plan-upgrade-nudge', () => () => null );

const { media } = fixtures;
const selectMediaItems = jest.fn();

// Some tests depend on persisting `selectedItems` between renders
// which is why this small HOC exists to mimic the Redux store
const withSelectedItems = ( Component ) => ( props ) => {
	const [ selectedItems, setSelectedItems ] = useState( [] );

	selectMediaItems.mockImplementation( ( siteId, mediaItems ) => {
		setSelectedItems( mediaItems );
	} );

	return (
		<Component { ...props } selectedItems={ selectedItems } selectMediaItems={ selectMediaItems } />
	);
};

describe( 'MediaLibraryList item selection', () => {
	let originalScrollTo;

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = () => null;
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;
	} );

	afterEach( () => {
		selectMediaItems.mockClear();
	} );

	describe( 'multiple selection', () => {
		const props = {
			filterRequiresUpgrade: false,
			media,
			mediaScale: 0.24,
			moment,
			selectMediaItems,
			selectedItems: [],
			site: { ID: DUMMY_SITE_ID },
		};

		test( 'allows selecting single items', async () => {
			const user = userEvent.setup();
			render( <MediaList { ...props } /> );
			const [ item1, item2 ] = media;

			await user.click( screen.getByTestId( `list-item-${ item1.ID }` ) );
			expect( selectMediaItems ).toHaveBeenCalledWith( DUMMY_SITE_ID, [ item1 ] );

			await user.click( screen.getByTestId( `list-item-${ item2.ID }` ) );
			expect( selectMediaItems ).toHaveBeenCalledWith( DUMMY_SITE_ID, [ item2 ] );
		} );

		test( 'allows selecting multiple items at once by Shift+clicking', async () => {
			const user = userEvent.setup();
			render( <MediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 1 ].ID }` ) );
			await user.keyboard( '{Shift>}' ); // `>` means keep the `Shift` key pressed
			await user.click( screen.getByTestId( `list-item-${ media[ 4 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, media.slice( 1, 5 ) );
		} );

		test( 'allows selecting single and multiple items', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 1 ].ID }` ) );
			await user.click( screen.getByTestId( `list-item-${ media[ 5 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 9 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 3, DUMMY_SITE_ID, [
				media[ 1 ],
				...media.slice( 5, 10 ),
			] );
		} );

		test( 'allows chaining Shift+click selections from first item', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 3 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, media.slice( 0, 4 ) );

			// Shift is still being pressed because of the `>` above
			await user.click( screen.getByTestId( `list-item-${ media[ 6 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 3, DUMMY_SITE_ID, media.slice( 0, 7 ) );
		} );

		test( 'allows chaining Shift+click selections to last item', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 3 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 6 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, media.slice( 3, 7 ) );

			// Shift is still being pressed because of the `>` above
			await user.click( screen.getByTestId( `list-item-${ media[ 9 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 3, DUMMY_SITE_ID, media.slice( 3 ) );
		} );

		test( 'allows chaining Shift+click deselections', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 9 ].ID }` ) );
			await user.keyboard( '{/Shift}' );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, media );

			await user.click( screen.getByTestId( `list-item-${ media[ 1 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 4 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 4, DUMMY_SITE_ID, [
				media[ 0 ],
				...media.slice( 5 ),
			] );

			// Shift is still being pressed because of the `>`
			await user.click( screen.getByTestId( `list-item-${ media[ 6 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 5, DUMMY_SITE_ID, [
				media[ 0 ],
				...media.slice( 7 ),
			] );
		} );

		test( 'allows selecting then deselecting multiple items', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 1 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 6 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, media.slice( 1, 7 ) );

			// Shift is still being pressed because of the `>`
			await user.click( screen.getByTestId( `list-item-${ media[ 1 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 3, DUMMY_SITE_ID, [] );
		} );

		test( 'selects the previously and currently clicked items when Shift+clicking', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 1 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 4 ].ID }` ) );
			await user.keyboard( '{/Shift}' );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, media.slice( 1, 5 ) );

			await user.click( screen.getByTestId( `list-item-${ media[ 5 ].ID }` ) );
			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );

			expect( selectMediaItems ).toHaveBeenNthCalledWith( 4, DUMMY_SITE_ID, [
				...media.slice( 1, 5 ),
				media[ 5 ],
				media[ 0 ],
			] );
		} );
	} );

	describe( 'single selection', () => {
		const props = {
			filterRequiresUpgrade: false,
			media,
			mediaScale: 0.24,
			moment,
			selectMediaItems,
			selectedItems: [],
			single: true,
			site: { ID: DUMMY_SITE_ID },
		};

		test( 'allows selecting a single item', async () => {
			const user = userEvent.setup();
			render( <MediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );
			expect( selectMediaItems ).toHaveBeenNthCalledWith( 1, DUMMY_SITE_ID, [ media[ 0 ] ] );

			await user.click( screen.getByTestId( `list-item-${ media[ 2 ].ID }` ) );
			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, [ media[ 2 ] ] );
		} );

		test( 'allows deselecting a single item', async () => {
			const user = userEvent.setup();
			const WrappedMediaList = withSelectedItems( MediaList );
			render( <WrappedMediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );
			expect( selectMediaItems ).toHaveBeenNthCalledWith( 1, DUMMY_SITE_ID, [ media[ 0 ] ] );

			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );
			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, [] );
		} );

		test( 'only selects a single item when selecting multiple via Shift+click', async () => {
			const user = userEvent.setup();
			render( <MediaList { ...props } /> );

			await user.click( screen.getByTestId( `list-item-${ media[ 0 ].ID }` ) );
			expect( selectMediaItems ).toHaveBeenNthCalledWith( 1, DUMMY_SITE_ID, [ media[ 0 ] ] );

			await user.keyboard( '{Shift>}' );
			await user.click( screen.getByTestId( `list-item-${ media[ 4 ].ID }` ) );
			expect( selectMediaItems ).toHaveBeenNthCalledWith( 2, DUMMY_SITE_ID, [ media[ 4 ] ] );
		} );
	} );

	describe( 'ungrouped sources', () => {
		const props = {
			filterRequiresUpgrade: false,
			media,
			mediaScale: 0.24,
			moment,
			selectMediaItems,
			selectedItems: [],
			single: true,
			site: { ID: DUMMY_SITE_ID },
		};

		test( 'should have no group label for an ungrouped source', () => {
			render( <MediaList { ...props } source="pexels" /> );
			expect( screen.queryAllByText( /September/ ) ).toHaveLength( 0 );
		} );

		test( 'should use group labels if source is not `pexels`', () => {
			// This test is added to enhance the previous one by testing the
			// reverse case because testing the absence of an element is prone
			// to failure if we don't test cases where it should be visible.
			// Ideally though we should:
			// @TODO: add tests for grid visible labels
			render( <MediaList { ...props } /> );
			screen.getAllByText( /September/ ).forEach( ( el ) => expect( el ).toBeVisible() );
		} );
	} );
} );
