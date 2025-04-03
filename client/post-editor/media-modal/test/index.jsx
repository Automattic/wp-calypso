/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import Modal from 'react-modal';
import MediaLibrary from 'calypso/my-sites/media-library';
import { ModalViews } from 'calypso/state/ui/media-modal/constants';
import { EditorMediaModal } from '../';

jest.mock( 'component-closest', () => {} );
jest.mock(
	'event',
	() => ( {
		bind: jest.fn,
		unbind: jest.fn,
	} ),
	{ virtual: true }
);
jest.mock( 'calypso/lib/accept', () => ( _, callback ) => {
	callback?.( true );
} );
jest.mock( 'calypso/my-sites/media-library', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );
jest.mock( 'calypso/blocks/image-editor', () => () => <div data-testid="image-editor" /> );
jest.mock( '../detail', () => () => <div data-testid="media-modal-detail-base" /> );
/**
 * Module variables
 */
const DUMMY_SITE = { ID: 1 };
const DUMMY_MEDIA = [
	{ ID: 100, date: '2015-06-19T11:36:09-04:00', mime_type: 'image/jpeg' },
	{ ID: 200, date: '2015-06-19T09:36:09-04:00', mime_type: 'image/jpeg' },
];
const DUMMY_VIDEO_MEDIA = [
	{ ID: 100, date: '2015-06-19T11:36:09-04:00', mime_type: 'video/mp4' },
];

describe( 'EditorMediaModal', () => {
	let spy;
	let deleteMedia;
	let onClose;
	let selectMediaItems;
	let changeMediaSource;
	let baseProps;

	beforeEach( () => {
		spy = jest.fn();
		deleteMedia = jest.fn();
		onClose = jest.fn();
		selectMediaItems = jest.fn();
		changeMediaSource = jest.fn();
		baseProps = {
			visible: true,
			selectMediaItems,
			site: DUMMY_SITE,
			selectedItems: DUMMY_MEDIA,
			translate,
			onClose,
			deleteMedia,
			changeMediaSource,
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'When `single` selection screen chosen should initialise with no items selected', () => {
		const { container } = render( <EditorMediaModal { ...baseProps } single view={ null } /> );
		Modal.setAppElement( container );
		expect( selectMediaItems ).toHaveBeenCalledWith( DUMMY_SITE.ID, [] );
	} );

	test( 'should prompt to delete a single item from the list view', async () => {
		const user = userEvent.setup();

		MediaLibrary.mockImplementationOnce( ( { onDeleteItem } ) => {
			return <button onClick={ onDeleteItem }>Delete</button>;
		} );

		const media = DUMMY_MEDIA.slice( 0, 1 );
		const props = { ...baseProps, selectedItems: media };
		const { container } = render( <EditorMediaModal { ...props } /> );

		Modal.setAppElement( container );

		await user.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		expect( props.deleteMedia ).toHaveBeenCalledWith(
			DUMMY_SITE.ID,
			media.map( ( { ID } ) => ID )
		);
	} );

	test( 'should prompt to delete multiple items from the list view', async () => {
		const user = userEvent.setup();

		MediaLibrary.mockImplementationOnce( ( { onDeleteItem } ) => {
			return <button onClick={ onDeleteItem }>Delete</button>;
		} );

		const props = { ...baseProps, selectedItems: DUMMY_MEDIA };
		const { container } = render( <EditorMediaModal { ...props } /> );

		Modal.setAppElement( container );

		await user.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		expect( baseProps.deleteMedia ).toHaveBeenCalledWith(
			DUMMY_SITE.ID,
			DUMMY_MEDIA.map( ( { ID } ) => ID )
		);
	} );

	test( 'should show no buttons if editing an image', () => {
		const props = {
			...baseProps,
			selectedItems: [],
			view: ModalViews.IMAGE_EDITOR,
			setView: spy,
		};
		const { container } = render( <EditorMediaModal { ...props } /> );

		Modal.setAppElement( container );

		expect( screen.getByTestId( 'image-editor' ) ).toBeVisible();
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	test( 'should show a Copy to media library button when viewing external media (no selection)', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				selectedItems={ [] }
				source="external"
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getByTestId( 'media-modal-detail-base' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /copy to media library/i } ) ).toBeVisible();
	} );

	test( 'should show a Copy to media library button when 1 external image is selected', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				selectedItems={ DUMMY_MEDIA.slice( 0, 1 ) }
				setView={ spy }
				source="external"
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 2 );
		expect( screen.getByRole( 'button', { name: /copy to media library/i } ) ).toBeVisible();
	} );

	test( 'should show a copy button when 1 external video is selected', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				selectedItems={ DUMMY_VIDEO_MEDIA }
				setView={ spy }
				source="external"
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 2 );
		expect( screen.getByRole( 'button', { name: /copy to media library/i } ) ).toBeVisible();
	} );

	test( 'should show a copy button when 2 or more external media are selected', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				source="external"
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 2 );
		expect( screen.getByRole( 'button', { name: /copy to media library/i } ) ).toBeVisible();
	} );

	test( 'should show a continue button when multiple images are selected', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				selectedItems={ DUMMY_MEDIA }
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeVisible();
	} );

	test( 'should show an insert button if none or one local items are selected', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				selectedItems={ [] }
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getByRole( 'button', { name: 'Insert' } ) ).toBeVisible();
	} );

	test( 'should show an insert button if multiple images are selected when gallery view is disabled', () => {
		const { container } = render(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				galleryViewEnabled={ false }
			/>
		);

		Modal.setAppElement( container );

		expect( screen.getByRole( 'button', { name: 'Insert' } ) ).toBeVisible();
	} );

	describe( '#confirmSelection()', () => {
		test( 'should close modal if viewing local media and button is pressed', async () => {
			const user = userEvent.setup();
			const { container } = render(
				<EditorMediaModal
					{ ...baseProps }
					visible
					view={ ModalViews.DETAIL }
					setView={ spy }
					selectedItems={ DUMMY_MEDIA }
					galleryViewEnabled={ false }
				/>
			);

			Modal.setAppElement( container );

			await user.click( screen.getByRole( 'button', { name: 'Insert' } ) );

			expect( onClose ).toHaveBeenCalledWith( {
				items: DUMMY_MEDIA,
				settings: undefined,
				type: 'media',
			} );
		} );

		test( 'should copy external media after loading WordPress library if 1 or more media are selected and button is pressed', async () => {
			const user = userEvent.setup();
			const originalRandomUUID = global.crypto.randomUUID;
			global.crypto.randomUUID = jest
				.fn()
				.mockImplementationOnce( () => '1' )
				.mockImplementationOnce( () => '2' );

			const addExternalMedia = jest.fn();

			const { container } = render(
				<EditorMediaModal
					{ ...baseProps }
					view={ ModalViews.DETAIL }
					setView={ spy }
					source="external"
					selectedItems={ DUMMY_MEDIA }
					setQuery={ () => {} }
					addExternalMedia={ addExternalMedia }
				/>
			);

			Modal.setAppElement( container );

			await user.click( screen.getByRole( 'button', { name: /copy to media library/i } ) );

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, DUMMY_MEDIA[ 0 ], { ID: 'media-1', transient: true } ),
				Object.assign( {}, DUMMY_MEDIA[ 1 ], { ID: 'media-2', transient: true } ),
			];

			expect( addExternalMedia ).toHaveBeenCalledWith(
				transientItems,
				DUMMY_SITE,
				undefined,
				'external'
			);

			global.crypto.randomUUID = originalRandomUUID;
		} );

		test( 'should copy external after loading WordPress library if 1 video is selected and button is pressed', async () => {
			const user = userEvent.setup();
			const originalRandomUUID = global.crypto.randomUUID;
			global.crypto.randomUUID = jest.fn().mockImplementationOnce( () => '3' );

			const addExternalMedia = jest.fn();

			const { container } = render(
				<EditorMediaModal
					{ ...baseProps }
					selectedItems={ DUMMY_VIDEO_MEDIA }
					view={ ModalViews.DETAIL }
					setView={ spy }
					source="external"
					setQuery={ () => {} }
					addExternalMedia={ addExternalMedia }
				/>
			);

			Modal.setAppElement( container );

			await user.click( screen.getByRole( 'button', { name: /copy to media library/i } ) );

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, DUMMY_VIDEO_MEDIA[ 0 ], { ID: 'media-3', transient: true } ),
			];

			expect( addExternalMedia ).toHaveBeenCalledWith(
				transientItems,
				DUMMY_SITE,
				undefined,
				'external'
			);
			global.crypto.randomUUID = originalRandomUUID;
		} );
	} );
} );
