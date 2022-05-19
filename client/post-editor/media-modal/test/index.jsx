/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import { translate } from 'i18n-calypso';
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
jest.mock( 'calypso/post-editor/media-modal/detail', () => ( {
	default: require( 'calypso/components/empty-component' ),
} ) );
jest.mock( 'calypso/post-editor/media-modal/gallery', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/post-editor/media-modal/markup', () => ( {
	get: ( x ) => x,
} ) );
jest.mock( 'calypso/post-editor/media-modal/secondary-actions', () =>
	require( 'calypso/components/empty-component' )
);
jest.mock( 'calypso/lib/accept', () => require( 'sinon' ).stub().callsArgWithAsync( 1, true ) );
jest.mock( 'calypso/my-sites/media-library', () =>
	require( 'calypso/components/empty-component' )
);

const mockV4 = jest.fn();
jest.mock( 'uuid', () => ( {
	v4: () => mockV4(),
} ) );

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
		shallow( <EditorMediaModal { ...baseProps } single={ true } view={ null } /> ).instance();
		expect( selectMediaItems ).toHaveBeenCalledWith( DUMMY_SITE.ID, [] );
	} );

	test( 'should prompt to delete a single item from the list view', () => {
		const media = DUMMY_MEDIA.slice( 0, 1 );

		const tree = shallow(
			<EditorMediaModal { ...baseProps } selectedItems={ media } />
		).instance();
		tree.deleteMedia();

		return new Promise( ( resolve ) => {
			process.nextTick( function () {
				expect( deleteMedia ).toHaveBeenCalledWith(
					DUMMY_SITE.ID,
					media.map( ( { ID } ) => ID )
				);
				resolve();
			} );
		} );
	} );

	test( 'should prompt to delete multiple items from the list view', () => {
		const tree = shallow( <EditorMediaModal { ...baseProps } /> ).instance();
		tree.deleteMedia();

		return new Promise( ( resolve ) => {
			process.nextTick( function () {
				expect( deleteMedia ).toHaveBeenCalledWith(
					DUMMY_SITE.ID,
					DUMMY_MEDIA.map( ( { ID } ) => ID )
				);
				resolve();
			} );
		} );
	} );

	test( 'should show no buttons if editing an image', () => {
		const tree = shallow(
			<EditorMediaModal
				{ ...baseProps }
				selectedItems={ [] }
				view={ ModalViews.IMAGE_EDITOR }
				setView={ spy }
			/>
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons ).toBeUndefined();
	} );

	test( 'should show a Copy to media library button when viewing external media (no selection)', () => {
		const tree = shallow(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				selectedItems={ [] }
			/>
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).toEqual( 2 );
		expect( buttons[ 1 ].label ).toEqual( 'Copy to media library' );
	} );

	test( 'should show a Copy to media library button when 1 external image is selected', () => {
		const tree = shallow(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				selectedItems={ DUMMY_MEDIA.slice( 0, 1 ) }
				setView={ spy }
			/>
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).toEqual( 2 );
		expect( buttons[ 1 ].label ).toEqual( 'Copy to media library' );
	} );

	test( 'should show a copy button when 1 external video is selected', () => {
		const tree = shallow(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				selectedItems={ DUMMY_VIDEO_MEDIA }
				setView={ spy }
			/>
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).toEqual( 2 );
		expect( buttons[ 1 ].label ).toEqual( 'Copy to media library' );
	} );

	test( 'should show a copy button when 2 or more external media are selected', () => {
		const tree = shallow(
			<EditorMediaModal { ...baseProps } view={ ModalViews.DETAIL } setView={ spy } />
		).instance();

		tree.setState( { source: 'external' } );
		const buttons = tree.getModalButtons();

		expect( buttons.length ).toEqual( 2 );
		expect( buttons[ 1 ].label ).toEqual( 'Copy to media library' );
	} );

	test( 'should show a continue button when multiple images are selected', () => {
		const tree = shallow(
			<EditorMediaModal { ...baseProps } view={ ModalViews.DETAIL } setView={ spy } />
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons[ 1 ].label ).toEqual( 'Continue' );
	} );

	test( 'should show an insert button if none or one local items are selected', () => {
		const tree = shallow(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				selectedItems={ [] }
			/>
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons[ 1 ].label ).toEqual( 'Insert' );
	} );

	test( 'should show an insert button if multiple images are selected when gallery view is disabled', () => {
		const tree = shallow(
			<EditorMediaModal
				{ ...baseProps }
				view={ ModalViews.DETAIL }
				setView={ spy }
				galleryViewEnabled={ false }
			/>
		).instance();

		const buttons = tree.getModalButtons();

		expect( buttons[ 1 ].label ).toEqual( 'Insert' );
	} );

	describe( '#confirmSelection()', () => {
		test( 'should close modal if viewing local media and button is pressed', () => {
			const tree = shallow(
				<EditorMediaModal { ...baseProps } view={ ModalViews.DETAIL } setView={ spy } />
			).instance();

			tree.confirmSelection();

			return new Promise( ( resolve ) => {
				process.nextTick( () => {
					expect( onClose ).toHaveBeenCalledWith( {
						items: DUMMY_MEDIA,
						settings: undefined,
						type: 'media',
					} );

					resolve();
				} );
			} );
		} );

		test( 'should copy external media after loading WordPress library if 1 or more media are selected and button is pressed', () => {
			mockV4.mockImplementationOnce( () => '1' );
			mockV4.mockImplementationOnce( () => '2' );

			const tree = shallow(
				<EditorMediaModal { ...baseProps } view={ ModalViews.DETAIL } setView={ spy } />
			).instance();

			tree.setState( { source: 'external' } );
			tree.copyExternalAfterLoadingWordPressLibrary = onClose;
			tree.confirmSelection();

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, DUMMY_MEDIA[ 0 ], { ID: 'media-1', transient: true } ),
				Object.assign( {}, DUMMY_MEDIA[ 1 ], { ID: 'media-2', transient: true } ),
			];

			return new Promise( ( resolve ) => {
				process.nextTick( () => {
					expect( onClose ).toHaveBeenCalledWith( transientItems, 'external' );
					resolve();
				} );
			} );
		} );

		test( 'should copy external after loading WordPress library if 1 video is selected and button is pressed', () => {
			mockV4.mockImplementationOnce( () => '3' );

			const tree = shallow(
				<EditorMediaModal
					{ ...baseProps }
					selectedItems={ DUMMY_VIDEO_MEDIA }
					view={ ModalViews.DETAIL }
					setView={ spy }
				/>
			).instance();

			tree.setState( { source: 'external' } );
			tree.copyExternalAfterLoadingWordPressLibrary = onClose;
			tree.confirmSelection();

			// EditorMediaModal will generate transient ID for the media selected
			// by using uniqueId, which increments its value within the same session.
			const transientItems = [
				Object.assign( {}, DUMMY_VIDEO_MEDIA[ 0 ], { ID: 'media-3', transient: true } ),
			];
			return new Promise( ( resolve ) => {
				process.nextTick( () => {
					expect( onClose ).toHaveBeenCalledWith( transientItems, 'external' );
					resolve();
				} );
			} );
		} );
	} );
} );
